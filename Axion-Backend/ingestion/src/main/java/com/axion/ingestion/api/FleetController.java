package com.axion.ingestion.api;

import com.axion.ingestion.dto.FleetSummaryResponse;
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

        if (keys == null) return summary;

        summary.setTotalVehicles(keys.size());

        for (String key : keys) {
            DigitalTwinState state = redisTemplate.opsForValue().get(key);
            if (state == null) continue;

            if (state.isOnline()) summary.setOnlineVehicles(summary.getOnlineVehicles() + 1);

            switch (state.getHealthState()) {
                case "HEALTHY" -> summary.setHealthy(summary.getHealthy() + 1);
                case "DEGRADED" -> summary.setDegraded(summary.getDegraded() + 1);
                case "CRITICAL" -> summary.setCritical(summary.getCritical() + 1);
            }
        }

        return summary;
    }
}
