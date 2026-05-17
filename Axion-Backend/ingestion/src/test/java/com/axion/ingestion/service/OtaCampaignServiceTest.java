package com.axion.ingestion.service;

import com.axion.ingestion.model.DigitalTwinState;
import com.axion.ingestion.model.TelemetrySnapshot;
import com.axion.ingestion.model.dto.CampaignCreateRequest;
import com.axion.ingestion.model.dto.CampaignResponse;
import com.axion.ingestion.model.primary.OtaCampaignEntity;
import com.axion.ingestion.model.primary.OtaJobEntity;
import com.axion.ingestion.repository.primary.OtaCampaignRepository;
import com.axion.ingestion.repository.primary.OtaJobRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests for the OTA Campaign lifecycle state machine:
 *   DRAFT → CANARY → ROLLOUT → COMPLETED
 *                  │            │
 *                  └──► HALTED ◄┘
 *
 * Verifies health-gating, auto-rollback, and transition guards.
 */
@ExtendWith(MockitoExtension.class)
class OtaCampaignServiceTest {

    @Mock private OtaCampaignRepository campaignRepo;
    @Mock private OtaJobRepository jobRepo;
    @Mock private RedisTemplate<String, DigitalTwinState> redisTemplate;
    @Mock private ValueOperations<String, DigitalTwinState> valueOps;

    private OtaCampaignService service;

    @BeforeEach
    void setUp() {
        service = new OtaCampaignService(campaignRepo, jobRepo, redisTemplate);
        // Set health-gate thresholds via reflection since @Value won't fire in unit tests
        setField(service, "socMinForOta", 30.0);
        setField(service, "tempMaxForOta", 45.0);
    }

    private void setField(Object target, String fieldName, Object value) {
        try {
            java.lang.reflect.Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set field " + fieldName, e);
        }
    }

    @Nested
    @DisplayName("Campaign Creation")
    class Creation {

        @Test
        @DisplayName("Creates campaign in DRAFT state with correct job count")
        void createCampaignInDraftState() {
            CampaignCreateRequest request = new CampaignCreateRequest();
            request.setTargetVersion("v2.1.0");
            request.setVehicleIds(List.of("v001", "v002", "v003"));
            request.setCanaryVehicleIds(List.of("v001"));

            when(campaignRepo.save(any(OtaCampaignEntity.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            CampaignResponse response = service.createCampaign(request, "admin");

            assertEquals("DRAFT", response.getStatus());
            assertEquals("v2.1.0", response.getTargetVersion());
            assertEquals(3, response.getTotalJobs());
            assertEquals("admin", response.getCreatedBy());

            // Verify the canary flag was set correctly
            ArgumentCaptor<OtaCampaignEntity> captor = ArgumentCaptor.forClass(OtaCampaignEntity.class);
            verify(campaignRepo).save(captor.capture());
            OtaCampaignEntity saved = captor.getValue();
            long canaryCount = saved.getJobs().stream().filter(OtaJobEntity::isCanary).count();
            assertEquals(1, canaryCount);
        }
    }

    @Nested
    @DisplayName("State Transition Guards")
    class TransitionGuards {

        @Test
        @DisplayName("Approve only works from DRAFT state")
        void approveRequiresDraftState() {
            OtaCampaignEntity campaign = buildCampaign("ROLLOUT", List.of("v001"));
            when(campaignRepo.findById("test-campaign")).thenReturn(Optional.of(campaign));

            assertThrows(RuntimeException.class, () -> service.approveCampaign("test-campaign"));
        }

        @Test
        @DisplayName("Halt rejects terminal states (COMPLETED, HALTED)")
        void haltRejectsTerminalStates() {
            OtaCampaignEntity completed = buildCampaign("COMPLETED", List.of("v001"));
            when(campaignRepo.findById("completed")).thenReturn(Optional.of(completed));
            assertThrows(RuntimeException.class, () -> service.haltCampaign("completed"));

            OtaCampaignEntity halted = buildCampaign("HALTED", List.of("v001"));
            when(campaignRepo.findById("halted")).thenReturn(Optional.of(halted));
            assertThrows(RuntimeException.class, () -> service.haltCampaign("halted"));
        }
    }

    @Nested
    @DisplayName("Health-Gated Deployment")
    class HealthGating {

        @Test
        @DisplayName("OTA refused when vehicle SOC is below threshold")
        void refusesLowSocVehicle() {
            when(redisTemplate.opsForValue()).thenReturn(valueOps);

            DigitalTwinState lowSoc = buildTwinState(20.0, 30.0, "DEGRADED");
            when(valueOps.get("digital_twin:v001")).thenReturn(lowSoc);

            OtaCampaignEntity campaign = buildCampaign("CANARY", List.of("v001"));
            campaign.getJobs().get(0).setCanary(true);
            when(campaignRepo.findById("test-campaign")).thenReturn(Optional.of(campaign));
            when(campaignRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

            // Execute canary - the vehicle should be refused due to low SOC
            service.executeCanaryPhase("test-campaign");

            // The job should be FAILED
            assertEquals("FAILED", campaign.getJobs().get(0).getState());
        }

        @Test
        @DisplayName("OTA refused when vehicle temperature exceeds threshold")
        void refusesHighTempVehicle() {
            when(redisTemplate.opsForValue()).thenReturn(valueOps);

            DigitalTwinState highTemp = buildTwinState(80.0, 50.0, "DEGRADED");
            when(valueOps.get("digital_twin:v002")).thenReturn(highTemp);

            OtaCampaignEntity campaign = buildCampaign("CANARY", List.of("v002"));
            campaign.getJobs().get(0).setCanary(true);
            when(campaignRepo.findById("test-campaign")).thenReturn(Optional.of(campaign));
            when(campaignRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

            service.executeCanaryPhase("test-campaign");

            assertEquals("FAILED", campaign.getJobs().get(0).getState());
        }

        @Test
        @DisplayName("OTA refused when vehicle is in CRITICAL state")
        void refusesCriticalVehicle() {
            when(redisTemplate.opsForValue()).thenReturn(valueOps);

            DigitalTwinState critical = buildTwinState(50.0, 35.0, "CRITICAL");
            when(valueOps.get("digital_twin:v003")).thenReturn(critical);

            OtaCampaignEntity campaign = buildCampaign("CANARY", List.of("v003"));
            campaign.getJobs().get(0).setCanary(true);
            when(campaignRepo.findById("test-campaign")).thenReturn(Optional.of(campaign));
            when(campaignRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

            service.executeCanaryPhase("test-campaign");

            assertEquals("FAILED", campaign.getJobs().get(0).getState());
        }
    }

    @Nested
    @DisplayName("Auto-Rollback Logic")
    class AutoRollback {

        @Test
        @DisplayName("Auto-rollback marks successful jobs as ROLLED_BACK")
        void autoRollbackMarksSuccessAsRolledBack() {
            OtaCampaignEntity campaign = buildCampaign("ROLLOUT", List.of("v001", "v002", "v003"));
            campaign.getJobs().get(0).setState("SUCCESS");
            campaign.getJobs().get(1).setState("FAILED");
            campaign.getJobs().get(2).setState("PENDING");

            when(campaignRepo.findById("test-campaign")).thenReturn(Optional.of(campaign));
            when(campaignRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

            service.autoRollback("test-campaign");

            assertEquals("HALTED", campaign.getStatus());
            assertEquals("ROLLED_BACK", campaign.getJobs().get(0).getState()); // was SUCCESS
            assertEquals("FAILED", campaign.getJobs().get(1).getState());       // stays FAILED
            assertEquals("ROLLED_BACK", campaign.getJobs().get(2).getState()); // was PENDING
            assertNotNull(campaign.getCompletedAt());
        }

        @Test
        @DisplayName("Manual halt marks pending/in-progress jobs as ROLLED_BACK")
        void manualHaltRollsBackPendingJobs() {
            OtaCampaignEntity campaign = buildCampaign("CANARY", List.of("v001", "v002"));
            campaign.getJobs().get(0).setState("SUCCESS");
            campaign.getJobs().get(1).setState("IN_PROGRESS");

            when(campaignRepo.findById("test-campaign")).thenReturn(Optional.of(campaign));
            when(campaignRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

            service.haltCampaign("test-campaign");

            assertEquals("HALTED", campaign.getStatus());
            assertEquals("SUCCESS", campaign.getJobs().get(0).getState());       // stays SUCCESS
            assertEquals("ROLLED_BACK", campaign.getJobs().get(1).getState()); // was IN_PROGRESS
        }
    }

    // ── Helpers ──

    private OtaCampaignEntity buildCampaign(String status, List<String> vehicleIds) {
        OtaCampaignEntity campaign = OtaCampaignEntity.builder()
                .campaignId("test-campaign")
                .targetVersion("v2.1.0")
                .status(status)
                .createdBy("admin")
                .jobs(new ArrayList<>())
                .build();

        for (String vid : vehicleIds) {
            OtaJobEntity job = OtaJobEntity.builder()
                    .jobId("job-" + vid)
                    .campaign(campaign)
                    .vehicleId(vid)
                    .state("PENDING")
                    .canary(false)
                    .build();
            campaign.getJobs().add(job);
        }

        return campaign;
    }

    private DigitalTwinState buildTwinState(double soc, double temp, String healthState) {
        DigitalTwinState state = new DigitalTwinState();
        state.setVehicleId("test");
        state.setOnline(true);
        state.setHealthState(healthState);
        TelemetrySnapshot snapshot = new TelemetrySnapshot();
        snapshot.setBatterySocPct(soc);
        snapshot.setBatteryTempC(temp);
        state.setTelemetry(snapshot);
        return state;
    }
}
