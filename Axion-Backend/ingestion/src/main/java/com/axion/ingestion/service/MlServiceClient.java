package com.axion.ingestion.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.concurrent.CompletableFuture;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class MlServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(MlServiceClient.class);
    private final WebClient webClient;
    private final RedisTemplate<String, Object> genericRedisTemplate;
    private final String mlServiceUrl;

    public MlServiceClient(
            @Qualifier("genericRedisTemplate") RedisTemplate<String, Object> genericRedisTemplate,
            @Value("${axion.ml.service.url:http://localhost:8000}") String mlServiceUrl,
            WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl(mlServiceUrl).build();
        this.genericRedisTemplate = genericRedisTemplate;
        this.mlServiceUrl = mlServiceUrl;
    }

    @SuppressWarnings("unchecked")
    public Mono<java.util.List<java.util.Map<String, Object>>> getFleetRiskRanking(Integer cacheTtlSeconds) {
        String cacheKey = "ml:fleet:risk_ranking";
        try {
            Object cached = genericRedisTemplate.opsForValue().get(cacheKey);
            if (cached instanceof java.util.List) {
                return Mono.just((java.util.List<java.util.Map<String, Object>>) cached);
            }
        } catch (Exception e) {
            logger.warn("Redis cache read failure for fleet risk ranking: {}", e.getMessage());
        }

        return webClient.get()
                .uri("/ml/v1/fleet/risk-ranking")
                .retrieve()
                .bodyToMono(java.util.List.class)
                .onErrorResume(e -> {
                    logger.warn("Failed to fetch fleet risk ranking from ML service: {}", e.getMessage());
                    return Mono.just(new java.util.ArrayList<>());
                })
                .map(res -> {
                    if (res == null) return new java.util.ArrayList<java.util.Map<String, Object>>();
                    return (java.util.List<java.util.Map<String, Object>>) res;
                })
                .doOnNext(res -> {
                    try {
                        int ttl = cacheTtlSeconds != null ? cacheTtlSeconds : 60;
                        genericRedisTemplate.opsForValue().set(cacheKey, res, ttl, java.util.concurrent.TimeUnit.SECONDS);
                    } catch (Exception e) {
                        logger.warn("Redis cache write failure for fleet risk ranking: {}", e.getMessage());
                    }
                });
    }

    @SuppressWarnings("unchecked")
    public CompletableFuture<Map<String, Object>> triggerRetraining() {
        Mono<Map<String, Object>> resMono = webClient.post()
                .uri("/ml/v1/retrain")
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorResume(e -> {
                    logger.warn("Failed to trigger retraining: {}", e.getMessage());
                    Map<String, Object> fallback = new HashMap<>();
                    fallback.put("status", "failed");
                    fallback.put("reason", "ML service unreachable");
                    return Mono.just(fallback);
                })
                .map(m -> (Map<String, Object>) m);
        return resMono.toFuture();
    }

    @SuppressWarnings("unchecked")
    public CompletableFuture<Map<String, Object>> getVehiclePredictions(String vehicleId) {
        String cacheKey = "ml_predictions:" + vehicleId;
        try {
            Object cached = genericRedisTemplate.opsForValue().get(cacheKey);
            if (cached instanceof Map) {
                return CompletableFuture.completedFuture((Map<String, Object>) cached);
            }
        } catch (Exception e) {
            logger.warn("Redis cache read failure for ML predictions: {}", e.getMessage());
        }

        Mono<Map> batteryMono = webClient.get()
                .uri("/ml/v1/predict/{id}/battery", vehicleId)
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorResume(e -> {
                    logger.warn("Failed to fetch battery prediction from ML service for vehicle {}: {}", vehicleId, e.getMessage());
                    return Mono.empty();
                });

        Mono<Map> tempMono = webClient.get()
                .uri("/ml/v1/predict/{id}/temperature", vehicleId)
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorResume(e -> {
                    logger.warn("Failed to fetch temperature prediction from ML service for vehicle {}: {}", vehicleId, e.getMessage());
                    return Mono.empty();
                });

        Mono<Map<String, Object>> resultMono = Mono.zip(batteryMono.defaultIfEmpty(new HashMap()), tempMono.defaultIfEmpty(new HashMap()))
                .map(tuple -> {
                    Map<String, Object> predictions = new HashMap<>();
                    Map batteryRes = tuple.getT1();
                    Map tempRes = tuple.getT2();

                    if (!batteryRes.isEmpty()) {
                        Map<String, Object> batteryMap = new HashMap<>();
                        batteryMap.put("hours", batteryRes.get("predictedDepletionHours"));
                        batteryMap.put("confidence", batteryRes.get("confidence"));
                        predictions.put("batteryDepletion", batteryMap);
                    } else {
                        Map<String, Object> fallback = new HashMap<>();
                        fallback.put("hours", null);
                        fallback.put("confidence", 0.0);
                        fallback.put("available", false);
                        fallback.put("reason", "ML service unreachable");
                        predictions.put("batteryDepletion", fallback);
                    }

                    if (!tempRes.isEmpty()) {
                        Map<String, Object> tempMap = new HashMap<>();
                        tempMap.put("risk", tempRes.get("anomalyRisk"));
                        tempMap.put("predictedPeakC", tempRes.get("predictedPeakC"));
                        predictions.put("tempAnomaly", tempMap);
                    } else {
                        Map<String, Object> fallback = new HashMap<>();
                        fallback.put("risk", "UNAVAILABLE");
                        fallback.put("predictedPeakC", null);
                        fallback.put("available", false);
                        fallback.put("reason", "ML service unreachable");
                        predictions.put("tempAnomaly", fallback);
                    }
                    return predictions;
                });

        return resultMono.doOnNext(predictions -> {
                    try {
                        genericRedisTemplate.opsForValue().set(cacheKey, predictions, 60, TimeUnit.SECONDS);
                    } catch (Exception e) {
                        logger.warn("Redis cache write failure for ML predictions: {}", e.getMessage());
                    }
                })
                .toFuture();
    }
}
