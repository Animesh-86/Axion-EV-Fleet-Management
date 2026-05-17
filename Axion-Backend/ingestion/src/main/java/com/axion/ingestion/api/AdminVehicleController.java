package com.axion.ingestion.api;

import com.axion.ingestion.dto.CreateVehicleRequest;
import com.axion.ingestion.model.DigitalTwinState;
import com.axion.ingestion.model.TelemetrySnapshot;
import com.axion.ingestion.service.VehicleRegistryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/vehicles")
public class AdminVehicleController {

    private final RedisTemplate<String, DigitalTwinState> redisTemplate;
    private final RedisTemplate<String, Object> genericRedisTemplate;
    private final VehicleRegistryService registryService;

    public AdminVehicleController(RedisTemplate<String, DigitalTwinState> redisTemplate,
                                  RedisTemplate<String, Object> genericRedisTemplate,
                                  @Autowired(required = false) VehicleRegistryService registryService) {
        this.redisTemplate = redisTemplate;
        this.genericRedisTemplate = genericRedisTemplate;
        this.registryService = registryService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createVehicle(@RequestBody CreateVehicleRequest req) {
        if (req.getId() == null || req.getId().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "id is required"));
        }

        String vehicleId = req.getId();
        String profile = req.getProfile() != null ? req.getProfile() : "sedan_standard";

        // 1. Register in vehicle registry (PostgreSQL + cache)
        if (registryService != null) {
            registryService.provision(vehicleId, profile, "admin-ui");
            log.info("Vehicle {} provisioned in registry via admin UI", vehicleId);
        }

        // 2. Create initial digital twin in Redis
        String key = "digital_twin:" + vehicleId;

        TelemetrySnapshot t = new TelemetrySnapshot();
        t.setSpeedKmph(0.0);
        t.setBatterySocPct(90.0);
        t.setBatteryTempC(30.0);
        t.setMotorTempC(35.0);
        t.setAmbientTempC(25.0);
        t.setOdometerKm(0.0);

        DigitalTwinState s = new DigitalTwinState();
        s.setVehicleId(vehicleId);
        s.setVendor("RUNTIME_MANUAL");
        s.setTelemetry(t);
        s.setOnline(true);
        s.setLastSeen(Instant.now());
        s.setHealthScore(100);
        s.setHealthState("HEALTHY");

        redisTemplate.opsForValue().set(key, s);

        // 3. Notify simulator to register the vehicle at runtime if requested
        if (req.getRegisterWithSimulator() == null || req.getRegisterWithSimulator()) {
            Map<String, Object> msg = new HashMap<>();
            msg.put("schema_version", 1);
            msg.put("cmd", "register_vehicle");
            msg.put("id", vehicleId);
            msg.put("profile", profile);
            msg.put("scenario", req.getScenario() != null ? req.getScenario() : "normal");
            genericRedisTemplate.convertAndSend("axion:simulator:commands", msg);
            log.info("Simulator registration command sent for vehicle {}", vehicleId);
        }

        return ResponseEntity.ok(Map.of(
                "vehicleId", vehicleId,
                "profile", profile,
                "registered", true,
                "simulatorNotified", req.getRegisterWithSimulator() == null || req.getRegisterWithSimulator()
        ));
    }
}

