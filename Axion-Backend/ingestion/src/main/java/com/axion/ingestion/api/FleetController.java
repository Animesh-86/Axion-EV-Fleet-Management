package com.axion.ingestion.api;

import com.axion.ingestion.dto.FleetSummaryResponse;
import com.axion.ingestion.dto.FleetVehicleResponse;
import com.axion.ingestion.model.DigitalTwinState;
import com.axion.ingestion.service.ThroughputTracker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/fleet")
public class FleetController {

    private final RedisTemplate<String, DigitalTwinState> redisTemplate;
    private final ThroughputTracker throughputTracker;
    private final com.axion.ingestion.service.MlServiceClient mlServiceClient;

    @Value("${axion.ml.escalation-threshold:0.7}")
    private double escalationThreshold;

    @Value("${axion.ml.cache-ttl:60}")
    private int mlCacheTtl;

    public FleetController(RedisTemplate<String, DigitalTwinState> redisTemplate,
            ThroughputTracker throughputTracker,
            com.axion.ingestion.service.MlServiceClient mlServiceClient) {
        this.redisTemplate = redisTemplate;
        this.throughputTracker = throughputTracker;
        this.mlServiceClient = mlServiceClient;
    }

    private Set<String> scanDigitalTwinKeys() {
        Set<String> keys = new HashSet<>();
        redisTemplate.execute((org.springframework.data.redis.core.RedisCallback<Void>) connection -> {
            try (org.springframework.data.redis.core.Cursor<byte[]> cursor = connection.scan(
                    org.springframework.data.redis.core.ScanOptions.scanOptions().match("digital_twin:*").count(1000).build())) {
                while (cursor.hasNext()) {
                    keys.add(new String(cursor.next()));
                }
            }
            return null;
        });
        return keys;
    }

    @GetMapping("/summary")
    public reactor.core.publisher.Mono<FleetSummaryResponse> getFleetSummary() {
        Set<String> keys = scanDigitalTwinKeys();
        FleetSummaryResponse summary = new FleetSummaryResponse();

        if (keys.isEmpty())
            return reactor.core.publisher.Mono.just(summary);

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

        summary.setEventsPerSecond(throughputTracker.getEventsPerSecond());
        summary.setTotalEventsProcessed(throughputTracker.getTotalEvents());

        return mlServiceClient.getFleetRiskRanking(mlCacheTtl)
            .map(list -> {
                long predicted = 0;
                if (list != null) {
                    for (java.util.Map<String, Object> m : list) {
                        Object rs = m.get("riskScore");
                        double val = 0.0;
                        if (rs instanceof Number) val = ((Number) rs).doubleValue();
                        else if (rs instanceof String) {
                            try { val = Double.parseDouble((String) rs); } catch (Exception ignored) {}
                        }
                        if (val >= escalationThreshold) {
                            predicted++;
                        }
                    }
                }
                summary.setPredictedCritical(predicted);
                return summary;
            })
            .onErrorResume(e -> {
                summary.setPredictedCritical(0);
                return reactor.core.publisher.Mono.just(summary);
            });
    }

    @GetMapping("/vehicles")
    public Map<String, Object> listVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        size = Math.min(Math.max(size, 1), 200);

        Set<String> keys = scanDigitalTwinKeys();
        java.util.List<FleetVehicleResponse> vehicles = new java.util.ArrayList<>();

        if (keys.isEmpty())
            return Map.of("content", vehicles, "page", page, "size", size, "totalElements", 0, "totalPages", 0);

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

            v.setOtaEligibility(state.isOtaEligibility());
            v.setLastUpdateTimestamp(state.getLastUpdateTimestamp());

            vehicles.add(v);
        }

        vehicles.sort(java.util.Comparator.comparingInt(FleetVehicleResponse::getHealthScore));

        int totalElements = vehicles.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int fromIndex = Math.min(page * size, totalElements);
        int toIndex = Math.min(fromIndex + size, totalElements);

        return Map.of(
                "content", vehicles.subList(fromIndex, toIndex),
                "page", page,
                "size", size,
                "totalElements", totalElements,
                "totalPages", totalPages
        );
    }

    @GetMapping("/risk-ranking")
    public reactor.core.publisher.Mono<org.springframework.http.ResponseEntity<java.util.List<java.util.Map<String, Object>>>> getFleetRiskRanking() {
        return mlServiceClient.getFleetRiskRanking(mlCacheTtl)
            .map(org.springframework.http.ResponseEntity::ok);
    }

    @org.springframework.web.bind.annotation.PostMapping("/ml-retrain")
    public java.util.concurrent.CompletableFuture<org.springframework.http.ResponseEntity<java.util.Map<String, Object>>> triggerRetraining() {
        return mlServiceClient.triggerRetraining()
            .thenApply(org.springframework.http.ResponseEntity::ok);
    }
}
