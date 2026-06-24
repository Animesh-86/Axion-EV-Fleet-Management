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

    private final com.axion.ingestion.producer.TelemetryProducer telemetryKafkaProducer;

    private final java.util.concurrent.ConcurrentHashMap<String, java.time.Instant> lastBroadcast = new java.util.concurrent.ConcurrentHashMap<>();

    private final Duration ttl;

    private final AnomalyExplainerService anomalyExplainerService;

    private final MlServiceClient mlServiceClient;

    private final java.util.concurrent.Executor mlTaskExecutor;

    public DigitalTwinService(RedisTemplate<String, DigitalTwinState> redisTemplate,
            HealthScoreEngine healthScoreEngine,
            SimpMessagingTemplate messagingTemplate,
            com.axion.ingestion.producer.TelemetryProducer telemetryKafkaProducer,
            @org.springframework.beans.factory.annotation.Autowired(required = false) AnomalyExplainerService anomalyExplainerService,
            @org.springframework.beans.factory.annotation.Autowired(required = false) MlServiceClient mlServiceClient,
            @org.springframework.beans.factory.annotation.Qualifier("mlTaskExecutor") java.util.concurrent.Executor mlTaskExecutor,
            @org.springframework.beans.factory.annotation.Value("${axion.redis.ttl-seconds}") int ttlSeconds) {
        this.redisTemplate = redisTemplate;
        this.healthScoringEngine = healthScoreEngine;
        this.messagingTemplate = messagingTemplate;
        this.telemetryKafkaProducer = telemetryKafkaProducer;
        this.anomalyExplainerService = anomalyExplainerService;
        this.mlServiceClient = mlServiceClient;
        this.mlTaskExecutor = mlTaskExecutor;
        this.ttl = Duration.ofSeconds(ttlSeconds);
    }

    public void update(CanonicalTelemetryEnvelope event) {
        String key = "digital_twin:" + event.getVehicleId();

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

        boolean success = false;
        int retries = 3;
        DigitalTwinState existing = null;

        while (!success && retries > 0) {
            final DigitalTwinState[] existingRef = new DigitalTwinState[1];
            java.util.List<Object> txResults = redisTemplate.execute(new org.springframework.data.redis.core.SessionCallback<java.util.List<Object>>() {
                @Override
                @SuppressWarnings("unchecked")
                public java.util.List<Object> execute(org.springframework.data.redis.core.RedisOperations operations) throws org.springframework.dao.DataAccessException {
                    operations.watch(key);
                    DigitalTwinState current = (DigitalTwinState) operations.opsForValue().get(key);
                    existingRef[0] = current;

                    if (current != null && current.getLastSeen() != null && event.getTimestamp().isBefore(current.getLastSeen())) {
                        operations.unwatch();
                        return java.util.Collections.singletonList("ABORT_STALE");
                    }

                    operations.multi();
                    operations.opsForValue().set(key, updated, ttl);
                    return operations.exec();
                }
            });

            if (txResults != null && !txResults.isEmpty()) {
                if ("ABORT_STALE".equals(txResults.get(0))) {
                    return; // Aborted because older timestamp
                }
                success = true;
                existing = existingRef[0];
            } else {
                retries--;
            }
        }

        if (!success) {
            log.warn("Optimistic locking failed for vehicle {} after retries", event.getVehicleId());
            return;
        }

        log.info("Digital twin updated in Redis: {} | health={} state={}", key, result.getScore(), result.getState());

        // Attach enriched data to event
        event.getTelemetry().setHealthScore((double) result.getScore());
        event.getTelemetry().setHealthState(result.getState().name());
        telemetryKafkaProducer.publishEnrichedAsync(event);

        // Broadcast TWIN_UPDATE with debouncing atomically
        java.time.Instant now = java.time.Instant.now();
        boolean[] shouldBroadcast = new boolean[1];
        lastBroadcast.compute(updated.getVehicleId(), (k, v) -> {
            if (v == null || java.time.Duration.between(v, now).toMillis() >= 1000) {
                shouldBroadcast[0] = true;
                return now;
            }
            return v;
        });

        if (shouldBroadcast[0]) {
            WebSocketMessage twinUpdateMsg = WebSocketMessage.builder()
                    .type("TWIN_UPDATE")
                    .vehicleId(updated.getVehicleId())
                    .data(updated)
                    .build();
            messagingTemplate.convertAndSend("/topic/fleet/updates", twinUpdateMsg);
            messagingTemplate.convertAndSend("/topic/vehicle/" + updated.getVehicleId(), twinUpdateMsg);
        }

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

            // Trigger explanation engine async if degraded or critical
            if (("DEGRADED".equals(result.getState().name()) || "CRITICAL".equals(result.getState().name())) 
                && anomalyExplainerService != null) {
                
                final String vId = updated.getVehicleId();
                final String targetState = result.getState().name();
                final double spd = snapshot.getSpeedKmph() != null ? snapshot.getSpeedKmph() : 0.0;
                final double soc = snapshot.getBatterySocPct() != null ? snapshot.getBatterySocPct() : 0.0;
                final double tmp = snapshot.getBatteryTempC() != null ? snapshot.getBatteryTempC() : 0.0;
                
                try {
                    if (mlServiceClient != null) {
                        mlServiceClient.getVehiclePredictions(vId).thenAcceptAsync(preds -> {
                            try {
                                String mlCtx = preds != null ? preds.toString() : "Predictions pending / unavailable";
                                anomalyExplainerService.explainAnomaly(vId, targetState, spd, soc, tmp, mlCtx);
                            } catch (Exception e) {
                                log.error("Asynchronous execution context of Anomaly Explainer engine failed: {}", e.getMessage());
                            }
                        }, mlTaskExecutor);
                    } else {
                        java.util.concurrent.CompletableFuture.runAsync(() -> {
                            try {
                                anomalyExplainerService.explainAnomaly(vId, targetState, spd, soc, tmp, "Predictions pending / unavailable");
                            } catch (Exception e) {
                                log.error("Asynchronous execution context of Anomaly Explainer engine failed: {}", e.getMessage());
                            }
                        }, mlTaskExecutor);
                    }
                } catch (java.util.concurrent.RejectedExecutionException e) {
                    log.warn("ML Task Executor queue full, skipping anomaly explanation for vehicle {}", vId);
                }
            }
        }
    }
}
