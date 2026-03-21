package com.axion.ingestion.api;

import com.axion.ingestion.dto.DigitalTwinResponse;
import com.axion.ingestion.model.DigitalTwinState;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/vehicles")
public class VehicleController {

    private final RedisTemplate<String, DigitalTwinState> redisTemplate;

    public VehicleController(RedisTemplate<String, DigitalTwinState> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<DigitalTwinResponse> getVehicle(
            @PathVariable String vehicleId) {

        String key = "digital_twin:" + vehicleId;
        DigitalTwinState state = redisTemplate.opsForValue().get(key);

        if (state == null) {
            return ResponseEntity.notFound().build();
        }

        DigitalTwinResponse response = map(state);
        return ResponseEntity.ok(response);
    }

    private DigitalTwinResponse map(DigitalTwinState state) {
        DigitalTwinResponse r = new DigitalTwinResponse();
        r.setVehicleId(state.getVehicleId());
        r.setOnline(state.isOnline());
        r.setLastSeen(state.getLastSeen());
        r.setHealthScore(state.getHealthScore());
        r.setHealthState(state.getHealthState());
        r.setTelemetry(state.getTelemetry());
        return r;
    }
}
