package com.axion.ingestion.api;

import com.axion.ingestion.dto.FleetSummaryResponse;
import com.axion.ingestion.dto.FleetVehicleResponse;
import com.axion.ingestion.model.DigitalTwinState;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@RequestMapping("/api/v1/fleet")
public class FleetController {

    private final RedisTemplate<String, DigitalTwinState> redisTemplate;

    public FleetController(RedisTemplate<String, DigitalTwinState> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @GetMapping("/summary")
    public FleetSummaryResponse getFleetSummary() {

        Set<String> keys = redisTemplate.keys("digital_twin:*");

        FleetSummaryResponse summary = new FleetSummaryResponse();

        if (keys == null)
            return summary;

        summary.setTotalVehicles(keys.size());

        for (String key : keys) {
            DigitalTwinState state = redisTemplate.opsForValue().get(key);
            if (state == null)
                continue;

            if (state.isOnline())
                summary.setOnlineVehicles(summary.getOnlineVehicles() + 1);

            switch (state.getHealthState()) {
                case "HEALTHY" -> summary.setHealthy(summary.getHealthy() + 1);
                case "DEGRADED" -> summary.setDegraded(summary.getDegraded() + 1);
                case "CRITICAL" -> summary.setCritical(summary.getCritical() + 1);
            }
        }

        return summary;
    }

    @GetMapping("/vehicles")
    public java.util.List<FleetVehicleResponse> listVehicles() {

        Set<String> keys = redisTemplate.keys("digital_twin:*");
        java.util.List<FleetVehicleResponse> vehicles = new java.util.ArrayList<>();

        if (keys == null)
            return vehicles;

        for (String key : keys) {
            DigitalTwinState state = redisTemplate.opsForValue().get(key);
            if (state == null)
                continue;

            FleetVehicleResponse v = new FleetVehicleResponse();
            v.setVehicleId(state.getVehicleId());
            v.setVendor(state.getVendor());
            v.setOnline(state.isOnline());
            v.setHealthScore(state.getHealthScore());
            v.setHealthState(state.getHealthState());
            v.setLastSeen(state.getLastSeen());

            if (state.getTelemetry() != null) {
                v.setBattery(state.getTelemetry().getBatterySocPct());
                v.setTemperature(state.getTelemetry().getBatteryTempC());
            }

            vehicles.add(v);
        }

        return vehicles;
    }

    @GetMapping("/{vehicleId}")
    public org.springframework.http.ResponseEntity<DigitalTwinState> getVehicle(
            @org.springframework.web.bind.annotation.PathVariable String vehicleId) {
        String key = "digital_twin:" + vehicleId;
        DigitalTwinState state = redisTemplate.opsForValue().get(key);
        if (state == null) {
            return org.springframework.http.ResponseEntity.notFound().build();
        }
        return org.springframework.http.ResponseEntity.ok(state);
    }
}
