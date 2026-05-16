package com.axion.ingestion.service;

import com.axion.ingestion.health.HealthScoreEngine;
import com.axion.ingestion.health.HealthScoreResult;
import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import com.axion.ingestion.model.DigitalTwinState;
import com.axion.ingestion.model.TelemetrySnapshot;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import com.axion.ingestion.model.dto.WebSocketMessage;

@Slf4j
@Service
public class DigitalTwinService {

    private final RedisTemplate<String, DigitalTwinState> redisTemplate;

    private final HealthScoreEngine healthScoringEngine;

    private final SimpMessagingTemplate messagingTemplate;

    private final Duration ttl;

    private final AnomalyExplainerService anomalyExplainerService;

    private final MlServiceClient mlServiceClient;

    public DigitalTwinService(RedisTemplate<String, DigitalTwinState> redisTemplate,
            HealthScoreEngine healthScoreEngine,
            SimpMessagingTemplate messagingTemplate,
            @org.springframework.beans.factory.annotation.Autowired(required = false) AnomalyExplainerService anomalyExplainerService,
            @org.springframework.beans.factory.annotation.Autowired(required = false) MlServiceClient mlServiceClient,
            @org.springframework.beans.factory.annotation.Value("${axion.redis.ttl-seconds}") int ttlSeconds) {
        this.redisTemplate = redisTemplate;
        this.healthScoringEngine = healthScoreEngine;
        this.messagingTemplate = messagingTemplate;
        this.anomalyExplainerService = anomalyExplainerService;
        this.mlServiceClient = mlServiceClient;
        this.ttl = Duration.ofSeconds(ttlSeconds);
    }

    public void update(CanonicalTelemetryEnvelope event) {
        String key = "digital_twin:" + event.getVehicleId();

        DigitalTwinState existing = redisTemplate.opsForValue().get(key);

        if (existing != null && existing.getLastSeen() != null
                && event.getTimestamp().isBefore(existing.getLastSeen())) {
            return;
        }

        DigitalTwinState updated = new DigitalTwinState();
        updated.setVehicleId(event.getVehicleId());
        updated.setVendor(event.getVendor());
        updated.setLastSeen(event.getIngestionTs());
        updated.setOnline(true);

        TelemetrySnapshot snapshot = new TelemetrySnapshot();
        if (event.getTelemetry() == null) {
            log.warn("Telemetry payload is null for vehicle={}", event.getVehicleId());
            return;
        }
        snapshot.setBatterySocPct(event.getTelemetry().getBatterySocPct());
        snapshot.setSpeedKmph(event.getTelemetry().getSpeedKmph());
        snapshot.setBatteryTempC(event.getTelemetry().getBatteryTempC());
        snapshot.setMotorTempC(event.getTelemetry().getMotorTempC());
        snapshot.setAmbientTempC(event.getTelemetry().getAmbientTempC());
        snapshot.setOdometerKm(event.getTelemetry().getOdometerKm());

        updated.setTelemetry(snapshot);

        HealthScoreResult result = healthScoringEngine.evaluate(updated);

        updated.setHealthScore(result.getScore());
        updated.setHealthState(result.getState().name());

        redisTemplate.opsForValue().set(key, updated, ttl);
        log.info("Digital twin updated in Redis: {} | health={} state={}", key, result.getScore(), result.getState());

        // Broadcast TWIN_UPDATE
        WebSocketMessage twinUpdateMsg = WebSocketMessage.builder()
                .type("TWIN_UPDATE")
                .vehicleId(updated.getVehicleId())
                .data(updated)
                .build();
        messagingTemplate.convertAndSend("/topic/fleet/updates", twinUpdateMsg);
        messagingTemplate.convertAndSend("/topic/vehicle/" + updated.getVehicleId(), twinUpdateMsg);

        // Check if health state changed
        if (existing != null && existing.getHealthState() != null &&
            !existing.getHealthState().equals(result.getState().name())) {
            
            WebSocketMessage healthChangeMsg = WebSocketMessage.builder()
                    .type("HEALTH_CHANGE")
                    .vehicleId(updated.getVehicleId())
                    .from(existing.getHealthState())
                    .to(result.getState().name())
                    .build();
            messagingTemplate.convertAndSend("/topic/fleet/updates", healthChangeMsg);
            messagingTemplate.convertAndSend("/topic/vehicle/" + updated.getVehicleId(), healthChangeMsg);

            // Phase 9A Autonomous LLM Trigger Sequence: Trigger explanation engine async if degraded or critical
            if (("DEGRADED".equals(result.getState().name()) || "CRITICAL".equals(result.getState().name())) 
                && anomalyExplainerService != null) {
                
                final String vId = updated.getVehicleId();
                final String targetState = result.getState().name();
                final double spd = snapshot.getSpeedKmph() != null ? snapshot.getSpeedKmph() : 0.0;
                final double soc = snapshot.getBatterySocPct() != null ? snapshot.getBatterySocPct() : 0.0;
                final double tmp = snapshot.getBatteryTempC() != null ? snapshot.getBatteryTempC() : 0.0;
                
                java.util.concurrent.CompletableFuture.runAsync(() -> {
                    try {
                        String mlCtx = "Predictions pending / unavailable";
                        if (mlServiceClient != null) {
                            java.util.Map<String, Object> preds = mlServiceClient.getVehiclePredictions(vId);
                            mlCtx = preds != null ? preds.toString() : mlCtx;
                        }
                        anomalyExplainerService.explainAnomaly(vId, targetState, spd, soc, tmp, mlCtx);
                    } catch (Exception e) {
                        log.error("Asynchronous execution context of Anomaly Explainer engine failed: {}", e.getMessage());
                    }
                });
            }
        }
    }
}
