package com.axion.ingestion.service;

import com.axion.ingestion.model.dto.AnomalyExplanation;
import com.axion.ingestion.model.primary.AnomalyExplanationEntity;
import com.axion.ingestion.repository.primary.AnomalyExplanationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AnomalyExplainerService {

    private final ChatClient.Builder chatClientBuilder;
    private final AnomalyExplanationRepository repository;
    private final VectorStore vectorStore;
    private final org.springframework.data.redis.core.StringRedisTemplate stringRedisTemplate;

    public AnomalyExplainerService(@org.springframework.beans.factory.annotation.Autowired(required = false) ChatClient.Builder chatClientBuilder, 
                                   @org.springframework.beans.factory.annotation.Autowired(required = false) AnomalyExplanationRepository repository,
                                   org.springframework.data.redis.core.StringRedisTemplate stringRedisTemplate,
                                   @org.springframework.beans.factory.annotation.Autowired(required = false) VectorStore vectorStore) {
        this.chatClientBuilder = chatClientBuilder;
        this.repository = repository;
        this.stringRedisTemplate = stringRedisTemplate;
        this.vectorStore = vectorStore;
    }

    public AnomalyExplanation explainAnomaly(String vehicleId, String healthState, double speed, double soc, double temp, String mlContext) {
        String debounceKey = "debounce:llm:" + vehicleId;
        Boolean isLocked = stringRedisTemplate.opsForValue().setIfAbsent(debounceKey, "locked", java.time.Duration.ofMinutes(15));
        
        if (Boolean.FALSE.equals(isLocked)) {
            log.info("Skipping LLM prompt for vehicle {} in state {} (debounced via Redis)", vehicleId, healthState);
            return AnomalyExplanation.builder()
                    .severity(healthState)
                    .summary("Diagnostic summary debounced.")
                    .rootCause("Thermal envelope recorded previously.")
                    .recommendedAction("Trigger manual diagnostic polling task")
                    .confidenceScore(0.50)
                    .build();
        }

        if (chatClientBuilder == null) {
            log.info("ChatClient.Builder unavailable, using fallback explanation for vehicle {}", vehicleId);
            return buildFallbackExplanation(vehicleId, healthState, soc, temp);
        }
        
        log.info("Generating anomaly explanation for vehicle {} in state {}", vehicleId, healthState);

        // 1. Prepare RAG context retrieval from pgvector
        String ragContext = "No historical incident precedent retrieved.";
        if (vectorStore != null) {
            try {
                String searchPrompt = String.format("Vehicle entering %s state with high thermal signature %.1f°C and battery state %.1f%%", healthState, temp, soc);
                List<Document> similarIncidents = vectorStore.similaritySearch(
                        SearchRequest.query(searchPrompt).withTopK(3)
                );
                if (!similarIncidents.isEmpty()) {
                    ragContext = similarIncidents.stream()
                            .map(Document::getContent)
                            .collect(Collectors.joining("\n---\n"));
                }
            } catch (Exception e) {
                log.warn("Vector similarity search warning: {}", e.getMessage());
            }
        }

        // 2. Deterministic output schema conversion
        BeanOutputConverter<AnomalyExplanation> converter = new BeanOutputConverter<>(AnomalyExplanation.class);
        String formatInstructions = converter.getFormat();

        // 3. Assemble prompt augmented with RAG context
        String promptText = String.format(
                "You are an expert autonomous Electric Vehicle fleet diagnostic AI engine.\n" +
                "Analyze the following real-time parameters for vehicle '%s' which has dropped to health state '%s':\n" +
                "- Velocity: %.1f km/h\n" +
                "- Battery SOC: %.1f%%\n" +
                "- Core Temperature: %.1f°C\n" +
                "- Secondary ML Evaluation Context: %s\n\n" +
                "Relevant past incident knowledgebase context retrieved from vector store:\n%s\n\n" +
                "Provide a structured diagnostic breakdown adhering exactly to the schema requested below.\n%s",
                vehicleId, healthState, speed, soc, temp, mlContext, ragContext, formatInstructions
        );

        try {
            String rawResponse = chatClientBuilder.build().prompt()
                    .user(promptText)
                    .call()
                    .content();

            AnomalyExplanation explanation = converter.convert(rawResponse);
            if (explanation == null) {
                throw new IllegalStateException("Structured schema binding output converter returned null pointer");
            }

            AnomalyExplanationEntity entity = AnomalyExplanationEntity.builder()
                    .id(UUID.randomUUID().toString())
                    .vehicleId(vehicleId)
                    .createdAt(Instant.now())
                    .severity(explanation.getSeverity() != null ? explanation.getSeverity() : healthState)
                    .summary(explanation.getSummary() != null ? explanation.getSummary() : "No summary provided")
                    .rootCause(explanation.getRootCause() != null ? explanation.getRootCause() : "Undiagnosed sensory sequence")
                    .recommendedAction(explanation.getRecommendedAction() != null ? explanation.getRecommendedAction() : "Initiate manual intervention")
                    .confidenceScore(explanation.getConfidenceScore() != null ? explanation.getConfidenceScore() : 0.85)
                    .build();

            if (repository != null) {
                repository.save(entity);
            }
            log.info("Successfully persisted structured explanation for vehicle {}", vehicleId);
            
            if (vectorStore != null) {
                try {
                    String embedContent = String.format("[%s] Vehicle %s dropped to %s due to: %s. Action taken: %s",
                            entity.getSeverity(), vehicleId, healthState, entity.getRootCause(), entity.getRecommendedAction());
                    vectorStore.add(List.of(new Document(embedContent)));
                } catch (Exception e) {
                    log.debug("Auto-embedding skipped: {}", e.getMessage());
                }
            }

            return explanation;

        } catch (Exception e) {
            log.error("AI explanation call failed: {}", e.getMessage(), e);
            return buildFallbackExplanation(vehicleId, healthState, soc, temp);
        }
    }

    private AnomalyExplanation buildFallbackExplanation(String vehicleId, String healthState, double soc, double temp) {
        AnomalyExplanation fallback = AnomalyExplanation.builder()
                .severity(healthState)
                .summary("Automated diagnostic summary unavailable. Review metrics directly.")
                .rootCause(String.format("Thermal envelope recorded at %.1f°C with capacity %.1f%%", temp, soc))
                .recommendedAction("Trigger manual diagnostic polling task")
                .confidenceScore(0.50)
                .build();

        AnomalyExplanationEntity entity = AnomalyExplanationEntity.builder()
                .id(UUID.randomUUID().toString())
                .vehicleId(vehicleId)
                .createdAt(Instant.now())
                .severity(fallback.getSeverity())
                .summary(fallback.getSummary())
                .rootCause(fallback.getRootCause())
                .recommendedAction(fallback.getRecommendedAction())
                .confidenceScore(fallback.getConfidenceScore())
                .build();

        if (repository != null) {
            repository.save(entity);
        }
        return fallback;
    }
}
