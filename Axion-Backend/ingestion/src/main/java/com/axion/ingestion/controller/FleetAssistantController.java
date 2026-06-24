package com.axion.ingestion.controller;

import com.axion.ingestion.model.primary.AnomalyExplanationEntity;
import com.axion.ingestion.repository.primary.AnomalyExplanationRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@RestController
@RequestMapping("/api/v1/ai")
public class FleetAssistantController {

    private final ChatClient.Builder chatClientBuilder;
    private final AnomalyExplanationRepository explanationRepository;
    private final RedisTemplate<String, Object> genericRedisTemplate;

    public FleetAssistantController(ChatClient.Builder chatClientBuilder,
                                    @Autowired(required = false) AnomalyExplanationRepository explanationRepository,
                                    @Autowired(required = false) RedisTemplate<String, Object> genericRedisTemplate) {
        this.chatClientBuilder = chatClientBuilder;
        this.explanationRepository = explanationRepository;
        this.genericRedisTemplate = genericRedisTemplate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatQueryRequest {
        private String prompt;
        private String sessionId;
    }

    /**
     * Retrieves deterministic structured anomaly explanation records generated autonomously
     * by the Spring AI Bean binding engine during sensory health breaches.
     */
    @GetMapping("/explanations/{vehicleId}")
    public ResponseEntity<List<AnomalyExplanationEntity>> getExplanations(@PathVariable String vehicleId) {
        return ResponseEntity.ok(explanationRepository.findByVehicleIdOrderByCreatedAtDesc(vehicleId));
    }

    /**
     * Natural language interactive assistant prompt stream supporting multi-turn memory
     * via Redis and live function calling capabilities to execute infrastructure probes.
     */
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamChatAssistant(@RequestBody ChatQueryRequest request) {
        String sessionKey = "chat_memory:" + (request.getSessionId() != null ? request.getSessionId() : "anonymous");
        
        // Retrieve Redis-backed conversation context (30-min TTL)
        StringBuilder history = new StringBuilder();
        try {
            Object cached = genericRedisTemplate.opsForValue().get(sessionKey);
            if (cached instanceof String) {
                history.append((String) cached).append("\n");
            }
        } catch (Exception e) {
            log.warn("Redis history retrieval for AI context memory failed: {}", e.getMessage());
        }

        String fullPrompt = history + "Operator: " + request.getPrompt();

        try {
                return chatClientBuilder.build().prompt()
                    .user(fullPrompt)
                    .functions("getVehicleStatus", "getFleetSummary")
                    .stream()
                    .content()
                    .doOnNext(token -> {
                        // Keep live append memory lightweight
                    })
                    .doOnComplete(() -> {
                        try {
                            // Update context memory
                            String updatedHistory = history + "Operator: " + request.getPrompt() + "\n[Response delivered]";
                            // Keep max context short to preserve tokens
                            if (updatedHistory.length() > 2000) {
                                updatedHistory = updatedHistory.substring(updatedHistory.length() - 2000);
                            }
                            genericRedisTemplate.opsForValue().set(sessionKey, updatedHistory, 30, TimeUnit.MINUTES);
                        } catch (Exception e) {
                            log.debug("Redis state sequence update tracking skipped: {}", e.getMessage());
                        }
                    })
                    .onErrorResume(e -> {
                        log.error("Streaming SSE Chat client error emitted: {}", e.getMessage());
                        return Flux.just("Error generating streaming LLM response sequence: " + e.getMessage());
                    });
        } catch (Exception e) {
            log.error("Chat client invocation failed: {}", e.getMessage(), e);
            return Flux.just("AI Fleet Assistant connectivity offline. Verify keys & token infrastructure.");
        }
    }
}
