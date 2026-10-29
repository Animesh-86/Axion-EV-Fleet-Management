package com.axion.ingestion.bootstrap;

import com.axion.ingestion.model.DigitalTwinState;
import com.axion.ingestion.model.TelemetrySnapshot;
import com.axion.ingestion.model.primary.VehicleRegistryEntity;
import com.axion.ingestion.service.VehicleRegistryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Set;

@Slf4j
@Component
@Order(3)
public class VehicleBootstrap implements CommandLineRunner {

    private final RedisTemplate<String, DigitalTwinState> redisTemplate;
    private final VehicleRegistryService registryService;

    @Value("${axion.bootstrap.enabled:false}")
    private boolean bootstrapEnabled;

    public VehicleBootstrap(RedisTemplate<String, DigitalTwinState> redisTemplate,
                            @Autowired(required = false) VehicleRegistryService registryService) {
        this.redisTemplate = redisTemplate;
        this.registryService = registryService;
    }

    @Override
    public void run(String... args) {
        if (!bootstrapEnabled) {
            return;
        }

        try {
            // Clean up any legacy unmapped EV prefix keys
            Set<String> legacyKeys = redisTemplate.keys("digital_twin:EV*");
            if (legacyKeys != null && !legacyKeys.isEmpty()) {
                redisTemplate.delete(legacyKeys);
                log.info("Purged {} legacy unmapped digital twin keys from Redis", legacyKeys.size());
            }

            if (registryService == null) {
                return;
            }

            List<VehicleRegistryEntity> registeredVehicles = registryService.listByState("ACTIVE");
            int initialized = 0;

            for (VehicleRegistryEntity vehicle : registeredVehicles) {
                String key = "digital_twin:" + vehicle.getVehicleId();
                if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
                    continue;
                }

                TelemetrySnapshot snapshot = new TelemetrySnapshot();
                snapshot.setSpeedKmph(0.0);
                snapshot.setBatterySocPct(90.0);
                snapshot.setBatteryTempC(28.0);
                snapshot.setMotorTempC(32.0);
                snapshot.setAmbientTempC(25.0);
                snapshot.setOdometerKm(12500.0);

                DigitalTwinState state = new DigitalTwinState();
                state.setVehicleId(vehicle.getVehicleId());
                state.setVendor("FLEET_BASE");
                state.setTelemetry(snapshot);
                state.setOnline(true);
                state.setLastSeen(Instant.now());
                state.setHealthScore(100);
                state.setHealthState("HEALTHY");
                state.setOtaEligibility(false);
                state.setLastUpdateTimestamp(Instant.now());

                redisTemplate.opsForValue().set(key, state);
                initialized++;
            }

            if (initialized > 0) {
                log.info("Initialized {} digital twins in Redis matching registered fleet assets", initialized);
            }
        } catch (Exception e) {
            log.error("Failed to initialize digital twin cache: {}", e.getMessage());
        }
    }
}
