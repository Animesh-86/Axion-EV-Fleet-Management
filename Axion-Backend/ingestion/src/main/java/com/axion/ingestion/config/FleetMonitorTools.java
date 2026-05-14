package com.axion.ingestion.config;

import com.axion.ingestion.model.DigitalTwinState;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

@Slf4j
@Configuration
public class FleetMonitorTools {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VehicleStatusRequest {
        private String vehicleId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FleetSummaryRequest {
        private String fleetFilter; // optional filter e.g. "ALL", "CRITICAL"
    }

    @Bean
    @Description("Query real-time cached Digital Twin telemetry state and sensory parameters for a specified electric vehicle ID")
    public Function<VehicleStatusRequest, Map<String, Object>> getVehicleStatus(RedisTemplate<String, DigitalTwinState> redisTemplate) {
        return request -> {
            log.info("Agentic tool invoked: getVehicleStatus for vehicle={}", request.getVehicleId());
            Map<String, Object> result = new HashMap<>();
            try {
                DigitalTwinState state = redisTemplate.opsForValue().get("digital_twin:" + request.getVehicleId());
                if (state != null) {
                    result.put("status", "FOUND");
                    result.put("healthState", state.getHealthState());
                    result.put("healthScore", state.getHealthScore());
                    result.put("telemetry", state.getTelemetry());
                } else {
                    result.put("status", "NOT_FOUND");
                    result.put("message", "Vehicle ID currently offline or unregistered in digital twin index.");
                }
            } catch (Exception e) {
                result.put("status", "ERROR");
                result.put("message", e.getMessage());
            }
            return result;
        };
    }

    @Bean
    @Description("Retrieve operational health summary across the entire active fleet, identifying high-risk or degraded asset volumes")
    public Function<FleetSummaryRequest, Map<String, Object>> getFleetSummary(RedisTemplate<String, DigitalTwinState> redisTemplate) {
        return request -> {
            log.info("Agentic tool invoked: getFleetSummary with filter={}", request.getFleetFilter());
            Map<String, Object> summary = new HashMap<>();
            try {
                Set<String> keys = redisTemplate.keys("digital_twin:*");
                int total = 0;
                int healthy = 0;
                int degraded = 0;
                int critical = 0;
                List<String> riskyVehicles = new ArrayList<>();

                if (keys != null) {
                    for (String key : keys) {
                        DigitalTwinState state = redisTemplate.opsForValue().get(key);
                        if (state != null) {
                            total++;
                            if ("HEALTHY".equalsIgnoreCase(state.getHealthState())) healthy++;
                            else if ("DEGRADED".equalsIgnoreCase(state.getHealthState())) {
                                degraded++;
                                riskyVehicles.add(state.getVehicleId());
                            }
                            else if ("CRITICAL".equalsIgnoreCase(state.getHealthState())) {
                                critical++;
                                riskyVehicles.add(state.getVehicleId());
                            }
                        }
                    }
                }
                summary.put("totalActiveTwins", total);
                summary.put("healthyCount", healthy);
                summary.put("degradedCount", degraded);
                summary.put("criticalCount", critical);
                summary.put("highRiskVehicleIds", riskyVehicles);
            } catch (Exception e) {
                summary.put("error", e.getMessage());
            }
            return summary;
        };
    }
}
