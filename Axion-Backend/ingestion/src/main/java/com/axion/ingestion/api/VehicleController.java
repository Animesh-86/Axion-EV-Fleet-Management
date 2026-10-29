package com.axion.ingestion.api;

import com.axion.ingestion.dto.DigitalTwinResponse;
import com.axion.ingestion.model.DigitalTwinState;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.axion.ingestion.service.MlServiceClient;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Slf4j
@RestController
@RequestMapping("/api/v1/vehicles")
public class VehicleController {

    private final RedisTemplate<String, DigitalTwinState> redisTemplate;
    private final MlServiceClient mlServiceClient;

    @org.springframework.beans.factory.annotation.Value("${axion.ml.prediction-timeout-seconds:3}")
    private int predictionTimeoutSeconds;

    public VehicleController(RedisTemplate<String, DigitalTwinState> redisTemplate, MlServiceClient mlServiceClient) {
        this.redisTemplate = redisTemplate;
        this.mlServiceClient = mlServiceClient;
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

        try {
            Map<String, Object> predictions = mlServiceClient
                    .getVehiclePredictions(state.getVehicleId())
                    .get(predictionTimeoutSeconds, TimeUnit.SECONDS);
            r.setPredictions(predictions);
        } catch (TimeoutException e) {
            log.warn("ML prediction timed out for vehicle {}", state.getVehicleId());
            r.setPredictions(buildFallbackPredictions("ML service timed out"));
        } catch (Exception e) {
            log.warn("ML prediction failed for vehicle {}: {}", state.getVehicleId(), e.getMessage());
            r.setPredictions(buildFallbackPredictions("ML service unavailable"));
        }

        return r;
    }

    private Map<String, Object> buildFallbackPredictions(String reason) {
        Map<String, Object> fallback = new HashMap<>();
        Map<String, Object> battery = new HashMap<>();
        battery.put("hours", null);
        battery.put("confidence", 0.0);
        battery.put("available", false);
        battery.put("reason", reason);
        fallback.put("batteryDepletion", battery);

        Map<String, Object> temp = new HashMap<>();
        temp.put("risk", "UNAVAILABLE");
        temp.put("predictedPeakC", null);
        temp.put("available", false);
        temp.put("reason", reason);
        fallback.put("tempAnomaly", temp);
        return fallback;
    }
}

