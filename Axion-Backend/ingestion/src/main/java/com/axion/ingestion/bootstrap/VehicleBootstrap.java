package com.axion.ingestion.bootstrap;

import com.axion.ingestion.model.DigitalTwinState;
import com.axion.ingestion.model.TelemetrySnapshot;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Component
public class VehicleBootstrap implements ApplicationRunner {

    private final RedisTemplate<String, DigitalTwinState> redisTemplate;
    private final RedisTemplate<String, Object> genericRedisTemplate;

    @Value("${axion.bootstrap.vehicle.count:250}")
    private int vehicleCount;

    @Value("${axion.bootstrap.vehicle.prefix:EV}")
    private String vehiclePrefix;

    @Value("${axion.bootstrap.registerWithSimulator:true}")
    private boolean registerWithSimulator;

    @Value("${axion.bootstrap.enabled:false}")
    private boolean bootstrapEnabled;

    public VehicleBootstrap(RedisTemplate<String, DigitalTwinState> redisTemplate,
                            RedisTemplate<String, Object> genericRedisTemplate) {
        this.redisTemplate = redisTemplate;
        this.genericRedisTemplate = genericRedisTemplate;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try {
            if (!bootstrapEnabled) {
                System.out.println("[BOOTSTRAP] Vehicle seeding disabled (axion.bootstrap.enabled=false)");
                return;
            }
            Set<String> keys = redisTemplate.keys("digital_twin:*");
            int existing = keys == null ? 0 : keys.size();
            if (existing >= vehicleCount) {
                System.out.println("[BOOTSTRAP] Digital twin count sufficient: " + existing);
                return;
            }

            int toCreate = vehicleCount - existing;
            System.out.println("[BOOTSTRAP] Creating " + toCreate + " vehicles to reach " + vehicleCount);
            for (int i = 1; i <= toCreate; i++) {
                String id = vehiclePrefix + String.format("%04d", existing + i);
                String key = "digital_twin:" + id;

                TelemetrySnapshot t = new TelemetrySnapshot();
                t.setSpeedKmph(0.0);
                t.setBatterySocPct(90.0);
                t.setBatteryTempC(30.0);
                t.setMotorTempC(35.0);
                t.setAmbientTempC(25.0);
                t.setOdometerKm(0.0);

                DigitalTwinState s = new DigitalTwinState();
                s.setVehicleId(id);
                s.setVendor("BOOTSTRAP");
                s.setTelemetry(t);
                s.setOnline(true);
                s.setLastSeen(Instant.now());
                s.setHealthScore(100);
                s.setHealthState("OK");
                s.setOtaEligibility(false);
                s.setLastUpdateTimestamp(Instant.now());

                redisTemplate.opsForValue().set(key, s);

                if (registerWithSimulator) {
                    Map<String, Object> msg = new HashMap<>();
                    msg.put("cmd", "register_vehicle");
                    msg.put("id", id);
                    msg.put("profile", "sedan");
                    msg.put("scenario", "normal_drive");
                    genericRedisTemplate.convertAndSend("axion:simulator:commands", msg);
                }
            }
            System.out.println("[BOOTSTRAP] Vehicle seeding complete.");
        } catch (Exception e) {
            System.err.println("[BOOTSTRAP] Vehicle seeding failed: " + e.getMessage());
        }
    }
}
