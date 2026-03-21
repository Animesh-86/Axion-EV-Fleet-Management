package com.axion.ingestion.service;

import com.axion.ingestion.model.DigitalTwinState;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Random;

@Slf4j
@Service
public class OtaService {

    private final RedisTemplate<String, DigitalTwinState> redisTemplate;
    private final Random random = new Random();

    @Value("${axion.health.soc-critical}")
    private double socMinForOta;

    @Value("${axion.health.battery-temp-critical}")
    private double tempMaxForOta;

    public OtaService(RedisTemplate<String, DigitalTwinState> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean triggerOta(String vehicleId, String campaignId) {
        String key = "digital_twin:" + vehicleId;
        DigitalTwinState state = redisTemplate.opsForValue().get(key);

        if (state == null) {
            return false;
        }

        // Health-gated OTA: refuse if battery low or temp high
        if (state.getTelemetry() != null) {
            Double soc = state.getTelemetry().getBatterySocPct();
            Double temp = state.getTelemetry().getBatteryTempC();
            if (soc != null && soc < socMinForOta) {
                log.warn("OTA refused for vehicle={}: battery too low ({}%)", vehicleId, soc);
                return false;
            }
            if (temp != null && temp > tempMaxForOta) {
                log.warn("OTA refused for vehicle={}: temperature too high ({}°C)", vehicleId, temp);
                return false;
            }
        }

        boolean success = random.nextDouble() > 0.2; // 80% success rate

        state.setLastUpdateTimestamp(Instant.now());
        state.setOtaEligibility(!success); // After successful OTA, not immediately eligible again

        redisTemplate.opsForValue().set(key, state);

        log.info("OTA triggered for vehicle={} campaign={} success={}", vehicleId, campaignId, success);
        return true;
    }
}
