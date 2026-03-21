package com.axion.ingestion.service;

import com.axion.ingestion.health.HealthScoreEngine;
import com.axion.ingestion.health.HealthScoreResult;
import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import com.axion.ingestion.model.DigitalTwinState;
import com.axion.ingestion.model.TelemetrySnapshot;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
public class DigitalTwinService {

    private final RedisTemplate<String, DigitalTwinState> redisTemplate;

    private final HealthScoreEngine healthScoringEngine;

    private final Duration ttl;

    public DigitalTwinService(RedisTemplate<String, DigitalTwinState> redisTemplate,
            HealthScoreEngine healthScoreEngine,
            @org.springframework.beans.factory.annotation.Value("${axion.redis.ttl-seconds}") int ttlSeconds) {
        this.redisTemplate = redisTemplate;
        this.healthScoringEngine = healthScoreEngine;
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
        log.debug("Digital twin updated in Redis: {} | health={} state={}", key, result.getScore(), result.getState());
    }
}
