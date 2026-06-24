package com.axion.ingestion.service;

import com.axion.ingestion.model.DigitalTwinState;
import com.axion.ingestion.model.dto.CampaignCreateRequest;
import com.axion.ingestion.model.dto.CampaignResponse;
import com.axion.ingestion.model.primary.OtaCampaignEntity;
import com.axion.ingestion.model.primary.OtaJobEntity;
import com.axion.ingestion.repository.primary.OtaCampaignRepository;
import com.axion.ingestion.repository.primary.OtaJobRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * OTA Campaign Lifecycle State Machine:
 *   DRAFT ──► CANARY ──► ROLLOUT ──► COMPLETED
 *                     │            │
 *                     └──► HALTED ◄┘
 */
@Slf4j
@Service
public class OtaCampaignService {

    private final OtaCampaignRepository campaignRepo;
    private final OtaJobRepository jobRepo;
    private final RedisTemplate<String, DigitalTwinState> redisTemplate;
    private final Random random = new Random();

    @Value("${axion.health.soc-critical:30.0}")
    private double socMinForOta;

    @Value("${axion.health.battery-temp-critical:45.0}")
    private double tempMaxForOta;

    private static final double FAILURE_RATE_THRESHOLD = 0.30; // 30% triggers auto-halt

    public OtaCampaignService(OtaCampaignRepository campaignRepo,
                              OtaJobRepository jobRepo,
                              RedisTemplate<String, DigitalTwinState> redisTemplate) {
        this.campaignRepo = campaignRepo;
        this.jobRepo = jobRepo;
        this.redisTemplate = redisTemplate;
    }

    // ──────── Campaign CRUD ────────

    @Transactional
    public CampaignResponse createCampaign(CampaignCreateRequest request, String createdBy) {
        String campaignId = UUID.randomUUID().toString();

        OtaCampaignEntity campaign = OtaCampaignEntity.builder()
                .campaignId(campaignId)
                .targetVersion(request.getTargetVersion())
                .status("DRAFT")
                .createdBy(createdBy)
                .createdAt(Instant.now())
                .jobs(new ArrayList<>())
                .build();

        Set<String> canarySet = new HashSet<>(
                request.getCanaryVehicleIds() != null ? request.getCanaryVehicleIds() : List.of());

        for (String vehicleId : request.getVehicleIds()) {
            OtaJobEntity job = OtaJobEntity.builder()
                    .jobId(UUID.randomUUID().toString())
                    .campaign(campaign)
                    .vehicleId(vehicleId)
                    .state("PENDING")
                    .canary(canarySet.contains(vehicleId))
                    .build();
            campaign.getJobs().add(job);
        }

        campaignRepo.save(campaign);
        log.info("Campaign created: id={} version={} vehicles={} canary={}",
                campaignId, request.getTargetVersion(), request.getVehicleIds().size(), canarySet.size());
        return mapToResponse(campaign);
    }

    public List<CampaignResponse> listCampaigns() {
        return campaignRepo.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CampaignResponse getCampaign(String campaignId) {
        OtaCampaignEntity campaign = campaignRepo.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found: " + campaignId));
        return mapToResponse(campaign);
    }

    // ──────── Lifecycle Transitions ────────

    /** DRAFT → CANARY: Start deploying to canary vehicles only */
    @Transactional
    public CampaignResponse approveCampaign(String campaignId) {
        OtaCampaignEntity campaign = campaignRepo.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        if (!"DRAFT".equals(campaign.getStatus())) {
            throw new RuntimeException("Campaign must be in DRAFT to approve. Current: " + campaign.getStatus());
        }

        campaign.setStatus("CANARY");
        campaignRepo.save(campaign);

        // Start canary deployment asynchronously
        executeCanaryPhase(campaignId);

        log.info("Campaign {} approved → CANARY phase started", campaignId);
        return mapToResponse(campaign);
    }

    /** Execute canary phase: deploy to canary vehicles, check health, then proceed */
    @Async
    public void executeCanaryPhase(String campaignId) {
        try {
            OtaCampaignEntity campaign = campaignRepo.findById(campaignId).orElseThrow();
            List<OtaJobEntity> canaryJobs = campaign.getJobs().stream()
                    .filter(OtaJobEntity::isCanary)
                    .collect(Collectors.toList());

            if (canaryJobs.isEmpty()) {
                // No canary defined — skip straight to rollout
                log.info("Campaign {}: No canary vehicles, proceeding to ROLLOUT", campaignId);
                transitionToRollout(campaignId);
                return;
            }

            // Deploy to canary vehicles
            for (OtaJobEntity job : canaryJobs) {
                deployToVehicle(job);
            }
            campaignRepo.save(campaign);

            // Wait for canary observation period (simulated: 10 seconds instead of 5 min)
            Thread.sleep(10_000);

            // Check canary results
            campaign = campaignRepo.findById(campaignId).orElseThrow();
            long canaryFailed = campaign.getJobs().stream()
                    .filter(OtaJobEntity::isCanary)
                    .filter(j -> "FAILED".equals(j.getState()))
                    .count();

            if (canaryFailed > 0) {
                log.warn("Campaign {}: Canary failed ({} failures) → HALTING", campaignId, canaryFailed);
                haltCampaign(campaignId);
            } else {
                log.info("Campaign {}: Canary passed → Proceeding to ROLLOUT", campaignId);
                transitionToRollout(campaignId);
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Canary phase interrupted for campaign {}", campaignId);
        }
    }

    /** CANARY → ROLLOUT: All remaining vehicles */
    @Transactional
    public CampaignResponse transitionToRollout(String campaignId) {
        OtaCampaignEntity campaign = campaignRepo.findById(campaignId).orElseThrow();
        campaign.setStatus("ROLLOUT");
        campaignRepo.save(campaign);

        // Deploy to non-canary vehicles asynchronously
        executeRolloutPhase(campaignId);

        return mapToResponse(campaign);
    }

    @Async
    public void executeRolloutPhase(String campaignId) {
        OtaCampaignEntity campaign = campaignRepo.findById(campaignId).orElseThrow();
        List<OtaJobEntity> rolloutJobs = campaign.getJobs().stream()
                .filter(j -> !j.isCanary() && "PENDING".equals(j.getState()))
                .collect(Collectors.toList());

        int totalRollout = rolloutJobs.size();
        int failCount = 0;

        for (OtaJobEntity job : rolloutJobs) {
            // Check failure rate threshold mid-rollout
            if (totalRollout > 0 && failCount > 0) {
                double failureRate = (double) failCount / totalRollout;
                if (failureRate >= FAILURE_RATE_THRESHOLD) {
                    log.error("Campaign {}: Failure rate {}% exceeds threshold → AUTO-HALTING",
                            campaignId, String.format("%.0f", failureRate * 100));
                    autoRollback(campaignId);
                    return;
                }
            }

            deployToVehicle(job);
            if ("FAILED".equals(job.getState())) {
                failCount++;
            }

            // Small delay between deployments (simulate real-world pacing)
            try { Thread.sleep(1_500); } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }

        campaignRepo.save(campaign);

        // Check final failure rate
        campaign = campaignRepo.findById(campaignId).orElseThrow();
        long totalFailed = campaign.getJobs().stream().filter(j -> "FAILED".equals(j.getState())).count();
        if (totalFailed > 0 && (double) totalFailed / campaign.getJobs().size() >= FAILURE_RATE_THRESHOLD) {
            autoRollback(campaignId);
        } else {
            campaign.setStatus("COMPLETED");
            campaign.setCompletedAt(Instant.now());
            campaignRepo.save(campaign);
            log.info("Campaign {} → COMPLETED successfully", campaignId);
        }
    }

    /** HALT campaign and rollback successful deployments */
    @Transactional
    public CampaignResponse haltCampaign(String campaignId) {
        OtaCampaignEntity campaign = campaignRepo.findById(campaignId).orElseThrow();

        if ("COMPLETED".equals(campaign.getStatus()) || "HALTED".equals(campaign.getStatus())) {
            throw new RuntimeException("Campaign already in terminal state: " + campaign.getStatus());
        }

        campaign.setStatus("HALTED");
        campaign.setCompletedAt(Instant.now());

        // Mark remaining PENDING jobs as ROLLED_BACK
        for (OtaJobEntity job : campaign.getJobs()) {
            if ("PENDING".equals(job.getState()) || "IN_PROGRESS".equals(job.getState())) {
                job.setState("ROLLED_BACK");
                job.setCompletedAt(Instant.now());
            }
        }

        campaignRepo.save(campaign);
        log.info("Campaign {} → HALTED (manual)", campaignId);
        return mapToResponse(campaign);
    }

    /** Auto-rollback: HALT + roll back successful vehicles */
    @Transactional
    public void autoRollback(String campaignId) {
        OtaCampaignEntity campaign = campaignRepo.findById(campaignId).orElseThrow();
        campaign.setStatus("HALTED");
        campaign.setCompletedAt(Instant.now());

        int rolledBack = 0;
        for (OtaJobEntity job : campaign.getJobs()) {
            if ("SUCCESS".equals(job.getState())) {
                job.setState("ROLLED_BACK");
                job.setCompletedAt(Instant.now());
                rolledBack++;
            } else if ("PENDING".equals(job.getState())) {
                job.setState("ROLLED_BACK");
                job.setCompletedAt(Instant.now());
            }
        }

        campaignRepo.save(campaign);
        log.warn("Campaign {} → AUTO-HALTED with {} vehicles rolled back", campaignId, rolledBack);
    }

    // ──────── Vehicle Deployment Logic ────────

    private void deployToVehicle(OtaJobEntity job) {
        String vehicleId = job.getVehicleId();
        job.setState("IN_PROGRESS");
        job.setStartedAt(Instant.now());

        String key = "digital_twin:" + vehicleId;
        DigitalTwinState state = redisTemplate.opsForValue().get(key);

        // Health-gated: refuse if vehicle is unhealthy
        if (state != null && state.getTelemetry() != null) {
            Double soc = state.getTelemetry().getBatterySocPct();
            Double temp = state.getTelemetry().getBatteryTempC();

            if (soc != null && soc < socMinForOta) {
                log.warn("OTA refused for {}: SOC {}% < {}%", vehicleId, soc, socMinForOta);
                job.setState("FAILED");
                job.setCompletedAt(Instant.now());
                return;
            }
            if (temp != null && temp > tempMaxForOta) {
                log.warn("OTA refused for {}: Temp {}°C > {}°C", vehicleId, temp, tempMaxForOta);
                job.setState("FAILED");
                job.setCompletedAt(Instant.now());
                return;
            }
            if ("CRITICAL".equals(state.getHealthState())) {
                log.warn("OTA refused for {}: Health state CRITICAL", vehicleId);
                job.setState("FAILED");
                job.setCompletedAt(Instant.now());
                return;
            }
        }

        // Simulate deployment network download & install process (3 seconds)
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            job.setState("FAILED");
            log.warn("OTA INTERRUPTED: vehicle={}", vehicleId);
            return;
        }

        // Simulate deployment outcome (80% success rate)
        boolean success = random.nextDouble() > 0.2;

        if (success) {
            job.setState("SUCCESS");
            log.info("OTA SUCCESS: vehicle={}", vehicleId);
        } else {
            job.setState("FAILED");
            log.warn("OTA FAILED: vehicle={}", vehicleId);
        }
        job.setCompletedAt(Instant.now());
    }

    // ──────── Response Mapping ────────

    private CampaignResponse mapToResponse(OtaCampaignEntity entity) {
        List<OtaJobEntity> jobs = entity.getJobs();
        long success = jobs.stream().filter(j -> "SUCCESS".equals(j.getState())).count();
        long failed = jobs.stream().filter(j -> "FAILED".equals(j.getState())).count();
        long pending = jobs.stream().filter(j -> "PENDING".equals(j.getState()) || "IN_PROGRESS".equals(j.getState())).count();
        long completed = jobs.stream().filter(j -> !"PENDING".equals(j.getState()) && !"IN_PROGRESS".equals(j.getState())).count();
        double progress = jobs.isEmpty() ? 0.0 : (double) completed / jobs.size();

        return CampaignResponse.builder()
                .campaignId(entity.getCampaignId())
                .targetVersion(entity.getTargetVersion())
                .status(entity.getStatus())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .completedAt(entity.getCompletedAt())
                .totalJobs(jobs.size())
                .successJobs((int) success)
                .failedJobs((int) failed)
                .pendingJobs((int) pending)
                .progress(progress)
                .jobs(jobs.stream().map(j -> CampaignResponse.JobResponse.builder()
                        .jobId(j.getJobId())
                        .vehicleId(j.getVehicleId())
                        .state(j.getState())
                        .canary(j.isCanary())
                        .startedAt(j.getStartedAt())
                        .completedAt(j.getCompletedAt())
                        .build()
                ).collect(Collectors.toList()))
                .build();
    }
}
