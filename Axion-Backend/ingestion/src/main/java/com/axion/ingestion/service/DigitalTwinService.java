package com.axion.ingestion.service;

import com.axion.ingestion.health.HealthScoreEngine;
import com.axion.ingestion.health.HealthScoreResult;
import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import com.axion.ingestion.model.DigitalTwinState;
import com.axion.ingestion.model.TelemetrySnapshot;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class DigitalTwinService {

    private final RedisTemplate<String, DigitalTwinState> redisTemplate;

    private HealthScoreEngine healthScoringEngine = new HealthScoreEngine();

    private static final Duration TTL = Duration.ofSeconds(120);

    public DigitalTwinService(RedisTemplate<String, DigitalTwinState> redisTemplate,
            HealthScoreEngine healthScoreEngine) {
        this.redisTemplate = redisTemplate;
        this.healthScoringEngine = healthScoreEngine;
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
        snapshot.setBatterySocPct(event.getTelemetry().getBatterySocPct());
        snapshot.setSpeedKmph(event.getTelemetry().getSpeedKmph());
        snapshot.setBatteryTempC(event.getTelemetry().getBatteryTempC());
        snapshot.setMotorTempC(event.getTelemetry().getMotorTempC());
        snapshot.setAmbientTempC(event.getTelemetry().getAmbientTempC());
        snapshot.setOdometerkm(event.getTelemetry().getOdometerKm());

        updated.setTelemetry(snapshot);

        HealthScoreResult result = healthScoringEngine.evaluate(updated);

        updated.setHealthScore(result.getScore());
        updated.setHealthState(result.getState().name());

        redisTemplate.opsForValue().set(key, updated, TTL);
        System.out.println("SAVED TO REDIS: " + key);
    }
}
