package com.axion.ingestion.api;

import com.axion.ingestion.dto.CreateVehicleRequest;
import com.axion.ingestion.model.DigitalTwinState;
import com.axion.ingestion.model.TelemetrySnapshot;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/vehicles")
public class AdminVehicleController {

    private final RedisTemplate<String, DigitalTwinState> redisTemplate;
    private final RedisTemplate<String, Object> genericRedisTemplate;

    public AdminVehicleController(RedisTemplate<String, DigitalTwinState> redisTemplate, RedisTemplate<String, Object> genericRedisTemplate) {
        this.redisTemplate = redisTemplate;
        this.genericRedisTemplate = genericRedisTemplate;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createVehicle(@RequestBody CreateVehicleRequest req) {
        if (req.getId() == null || req.getId().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "id is required"));
        }

        String vehicleId = req.getId();
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
        s.setHealthState("OK");
        s.setOtaEligibility(false);
        s.setLastUpdateTimestamp(Instant.now());

        redisTemplate.opsForValue().set(key, s);

        // Notify simulator to register the vehicle at runtime if requested
        if (req.getRegisterWithSimulator() == null || req.getRegisterWithSimulator()) {
            Map<String, Object> msg = new HashMap<>();
            msg.put("schema_version", 1);
            msg.put("cmd", "register_vehicle");
            msg.put("id", vehicleId);
            msg.put("profile", req.getProfile());
            msg.put("scenario", req.getScenario());
            genericRedisTemplate.convertAndSend("axion:simulator:commands", msg);
        }

        return ResponseEntity.ok(Map.of("vehicleId", vehicleId, "created", true));
    }
}
