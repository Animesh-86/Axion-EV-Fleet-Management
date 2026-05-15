package com.axion.ingestion.api;

import com.axion.ingestion.dto.FleetSummaryResponse;
import com.axion.ingestion.dto.FleetVehicleResponse;
import com.axion.ingestion.model.DigitalTwinState;
import com.axion.ingestion.model.dto.WebSocketMessage;
import com.axion.ingestion.service.ThroughputTracker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/v1/fleet")
public class FleetController {

    private final RedisTemplate<String, DigitalTwinState> redisTemplate;
    private final RedisTemplate<String, Object> genericRedisTemplate;
    private final ThroughputTracker throughputTracker;
    private final com.axion.ingestion.service.MlServiceClient mlServiceClient;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${axion.ml.auto-escalate:false}")
    private boolean autoEscalate;

    @Value("${axion.ml.escalation-threshold:0.7}")
    private double escalationThreshold;

    @Value("${axion.ml.escalation-hysteresis:2}")
    private int escalationHysteresis;

    @Value("${axion.ml.escalation-streak-ttl-seconds:120}")
    private int escalationStreakTtlSeconds;

    public FleetController(RedisTemplate<String, DigitalTwinState> redisTemplate,
            RedisTemplate<String, Object> genericRedisTemplate,
            ThroughputTracker throughputTracker,
            com.axion.ingestion.service.MlServiceClient mlServiceClient,
            SimpMessagingTemplate messagingTemplate) {
        this.redisTemplate = redisTemplate;
        this.genericRedisTemplate = genericRedisTemplate;
        this.throughputTracker = throughputTracker;
        this.mlServiceClient = mlServiceClient;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping("/summary")
    public FleetSummaryResponse getFleetSummary() {

        Set<String> keys = redisTemplate.keys("digital_twin:*");

        FleetSummaryResponse summary = new FleetSummaryResponse();

        if (keys == null)
            return summary;

        summary.setTotalVehicles(keys.size());

        for (String key : keys) {
            DigitalTwinState state = redisTemplate.opsForValue().get(key);
            if (state == null)
                continue;

            if (state.isOnline())
                summary.setOnlineVehicles(summary.getOnlineVehicles() + 1);

            switch (state.getHealthState()) {
                case "HEALTHY" -> summary.setHealthy(summary.getHealthy() + 1);
                case "DEGRADED" -> summary.setDegraded(summary.getDegraded() + 1);
                case "CRITICAL" -> summary.setCritical(summary.getCritical() + 1);
            }
        }

        summary.setEventsPerSecond(throughputTracker.getEventsPerSecond());
        summary.setTotalEventsProcessed(throughputTracker.getTotalEvents());

        // Fetch ML-predicted fleet risk ranking (cached by MlServiceClient)
        long predicted = 0;
        try {
            int cacheTtl = Integer.parseInt(System.getenv().getOrDefault("AXION_ML_CACHE_TTL", "60"));
            java.util.List<java.util.Map<String, Object>> list = mlServiceClient.getFleetRiskRanking(cacheTtl);

            Set<String> escalateIds = new HashSet<>();
            if (list != null) {
                for (java.util.Map<String, Object> m : list) {
                    Object rs = m.get("riskScore");
                    double val = 0.0;
                    if (rs instanceof Number) val = ((Number) rs).doubleValue();
                    else if (rs instanceof String) {
                        try { val = Double.parseDouble((String) rs); } catch (Exception ignored) {}
                    }
                    if (val >= escalationThreshold) {
                        predicted++;
                        Object vid = m.get("vehicleId");
                        if (vid != null) escalateIds.add(String.valueOf(vid));
                    }
                }
            }

            // Optional auto-escalation: mark twins CRITICAL only after consecutive high-risk reads.
            if (autoEscalate && !escalateIds.isEmpty()) {
                for (String vId : escalateIds) {
                    try {
                        String streakKey = "ml:escalation_streak:" + vId;
                        Integer streak = readInt(genericRedisTemplate.opsForValue().get(streakKey));
                        int nextStreak = streak + 1;
                        genericRedisTemplate.opsForValue().set(streakKey, nextStreak, escalationStreakTtlSeconds, TimeUnit.SECONDS);

                        if (nextStreak >= escalationHysteresis) {
                            String key = "digital_twin:" + vId;
                            DigitalTwinState state = redisTemplate.opsForValue().get(key);
                            if (state != null && !"CRITICAL".equalsIgnoreCase(state.getHealthState())) {
                                String previousState = state.getHealthState();
                                state.setHealthState("CRITICAL");
                                Integer currentScore = state.getHealthScore();
                                state.setHealthScore(currentScore == null ? 49 : Math.min(currentScore, 49));
                                redisTemplate.opsForValue().set(key, state);
                                escalatedStates.add(state);

                                WebSocketMessage twinUpdateMsg = WebSocketMessage.builder()
                                        .type("TWIN_UPDATE")
                                        .vehicleId(state.getVehicleId())
                                        .data(state)
                                        .build();
                                messagingTemplate.convertAndSend("/topic/fleet/updates", twinUpdateMsg);
                                messagingTemplate.convertAndSend("/topic/vehicle/" + state.getVehicleId(), twinUpdateMsg);

                                WebSocketMessage healthChangeMsg = WebSocketMessage.builder()
                                        .type("HEALTH_CHANGE")
                                        .vehicleId(state.getVehicleId())
                                        .from(previousState)
                                        .to("CRITICAL")
                                        .message("Auto-escalated from ML risk threshold")
                                        .build();
                                messagingTemplate.convertAndSend("/topic/fleet/updates", healthChangeMsg);
                                messagingTemplate.convertAndSend("/topic/vehicle/" + state.getVehicleId(), healthChangeMsg);
                            }
                        }
                    } catch (Exception ignored) {
                    }
                }

                // Reset streaks for vehicles that fell below the threshold in this polling cycle.
                if (list != null) {
                    for (java.util.Map<String, Object> m : list) {
                        Object rs = m.get("riskScore");
                        double val = 0.0;
                        if (rs instanceof Number) val = ((Number) rs).doubleValue();
                        else if (rs instanceof String) {
                            try { val = Double.parseDouble((String) rs); } catch (Exception ignored) {}
                        }
                        Object vid = m.get("vehicleId");
                        if (vid != null && val < escalationThreshold) {
                            try {
                                genericRedisTemplate.opsForValue().set("ml:escalation_streak:" + vid, 0, escalationStreakTtlSeconds, TimeUnit.SECONDS);
                            } catch (Exception ignored) {
                            }
                        }
                    }
                }
            }

            summary.setPredictedCritical(predicted);
        } catch (Exception ignored) {
            summary.setPredictedCritical(0);
        }

        return summary;
    }

    @GetMapping("/vehicles")
    public java.util.List<FleetVehicleResponse> listVehicles() {

        Set<String> keys = redisTemplate.keys("digital_twin:*");
        java.util.List<FleetVehicleResponse> vehicles = new java.util.ArrayList<>();

        if (keys == null)
            return vehicles;

        for (String key : keys) {
            DigitalTwinState state = redisTemplate.opsForValue().get(key);
            if (state == null)
                continue;

            FleetVehicleResponse v = new FleetVehicleResponse();
            v.setVehicleId(state.getVehicleId());
            v.setVendor(state.getVendor());
            v.setOnline(state.isOnline());
            v.setHealthScore(state.getHealthScore());
            v.setHealthState(state.getHealthState());
            v.setLastSeen(state.getLastSeen());

            if (state.getTelemetry() != null) {
                v.setBattery(state.getTelemetry().getBatterySocPct());
                v.setTemperature(state.getTelemetry().getBatteryTempC());
            }

            v.setOtaEligibility(state.isOtaEligibility());
            v.setLastUpdateTimestamp(state.getLastUpdateTimestamp());

            vehicles.add(v);
        }

        return vehicles;
    }

    private Integer readInt(Object value) {
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        if (value instanceof String) {
            try {
                return Integer.parseInt((String) value);
            } catch (Exception ignored) {
            }
        }
        return 0;
    }

    @GetMapping("/{vehicleId}")
    public org.springframework.http.ResponseEntity<DigitalTwinState> getVehicle(
            @org.springframework.web.bind.annotation.PathVariable String vehicleId) {
        String key = "digital_twin:" + vehicleId;
        DigitalTwinState state = redisTemplate.opsForValue().get(key);
        if (state == null) {
            return org.springframework.http.ResponseEntity.notFound().build();
        }
        return org.springframework.http.ResponseEntity.ok(state);
    }
}
