package com.axion.ingestion.service;

import com.axion.ingestion.model.DigitalTwinState;
import com.axion.ingestion.model.dto.WebSocketMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
public class MlAutoEscalationService {

    private static final Logger logger = LoggerFactory.getLogger(MlAutoEscalationService.class);

    private final RedisTemplate<String, DigitalTwinState> redisTemplate;
    private final RedisTemplate<String, Object> genericRedisTemplate;
    private final MlServiceClient mlServiceClient;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${axion.ml.auto-escalate:false}")
    private boolean autoEscalate;

    @Value("${axion.ml.escalation-threshold:0.7}")
    private double escalationThreshold;

    @Value("${axion.ml.escalation-hysteresis:2}")
    private int escalationHysteresis;

    @Value("${axion.ml.escalation-streak-ttl-seconds:120}")
    private int escalationStreakTtlSeconds;

    public MlAutoEscalationService(RedisTemplate<String, DigitalTwinState> redisTemplate,
                                   @Qualifier("genericRedisTemplate") RedisTemplate<String, Object> genericRedisTemplate,
                                   MlServiceClient mlServiceClient,
                                   SimpMessagingTemplate messagingTemplate) {
        this.redisTemplate = redisTemplate;
        this.genericRedisTemplate = genericRedisTemplate;
        this.mlServiceClient = mlServiceClient;
        this.messagingTemplate = messagingTemplate;
    }

    @Scheduled(fixedDelayString = "${axion.ml.scheduler-interval-ms:60000}")
    public void runAutoEscalationCycle() {
        try {
            if (!autoEscalate) return;

            int cacheTtl = Integer.parseInt(System.getenv().getOrDefault("AXION_ML_CACHE_TTL", "60"));
            List<Map<String, Object>> list = mlServiceClient.getFleetRiskRanking(cacheTtl);
            if (list == null || list.isEmpty()) return;

            Set<String> escalateIds = new HashSet<>();
            for (Map<String, Object> m : list) {
                Object rs = m.get("riskScore");
                double val = 0.0;
                if (rs instanceof Number) val = ((Number) rs).doubleValue();
                else if (rs instanceof String) {
                    try { val = Double.parseDouble((String) rs); } catch (Exception ignored) {}
                }
                if (val >= escalationThreshold) {
                    Object vid = m.get("vehicleId");
                    if (vid != null) escalateIds.add(String.valueOf(vid));
                }
            }

            if (escalateIds.isEmpty()) return;

            for (String vId : escalateIds) {
                try {
                    String streakKey = "ml:escalation_streak:" + vId;
                    Integer streak = toInt(genericRedisTemplate.opsForValue().get(streakKey));
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
                } catch (Exception e) {
                    logger.warn("Error during ML auto-escalation for {}: {}", vId, e.getMessage());
                }
            }

            // Reset streaks for vehicles that fell below the threshold in this polling cycle.
            for (Map<String, Object> m : list) {
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
                    } catch (Exception ignored) {}
                }
            }

        } catch (Exception e) {
            logger.warn("ML auto-escalation cycle failed: {}", e.getMessage());
        }
    }

    private Integer toInt(Object o) {
        if (o instanceof Number) return ((Number) o).intValue();
        if (o instanceof String) {
            try { return Integer.parseInt((String) o); } catch (Exception ignored) {}
        }
        return 0;
    }
}
