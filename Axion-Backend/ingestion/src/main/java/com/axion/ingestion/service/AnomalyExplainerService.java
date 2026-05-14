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

    private final ChatClient chatClient;
    private final AnomalyExplanationRepository repository;
    private final VectorStore vectorStore;

    public AnomalyExplainerService(ChatClient.Builder chatClientBuilder, 
                                   AnomalyExplanationRepository repository,
                                   @Autowired(required = false) VectorStore vectorStore) {
        this.chatClient = chatClientBuilder.build();
        this.repository = repository;
        this.vectorStore = vectorStore;
    }

    /**
     * Explains an anomaly by prompting the LLM with real-time sensory states,
     * augmenting prompts with semantically similar past incidents retrieved via RAG (pgvector),
     * and strictly binding response schemas into target deterministic POJOs.
     */
    public AnomalyExplanation explainAnomaly(String vehicleId, String healthState, double speed, double soc, double temp, String mlContext) {
        log.info("Triggering GenAI Anomaly Explanation engine for vehicle {} in state {}", vehicleId, healthState);

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
                log.warn("PgVector similarity search encountered warning, proceeding with fallback logic: {}", e.getMessage());
            }
        }

        // 2. Set up deterministic output conversion target binding
        BeanOutputConverter<AnomalyExplanation> converter = new BeanOutputConverter<>(AnomalyExplanation.class);
        String formatInstructions = converter.getFormat();

        // 3. Assemble prompt augmented with RAG state contexts
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
            String rawResponse = chatClient.prompt()
                    .user(promptText)
                    .call()
                    .content();

            // Parse response directly to typed POJO
            AnomalyExplanation explanation = converter.convert(rawResponse);
            if (explanation == null) {
                throw new IllegalStateException("Structured schema binding output converter returned null pointer");
            }

            // Persist structured explanation to PostgreSQL primary cluster
            AnomalyExplanationEntity entity = AnomalyExplanationEntity.builder()
                    .id(UUID.randomUUID().toString())
                    .vehicleId(vehicleId)
                    .createdAt(Instant.now())
                    .severity(explanation.getSeverity() != null ? explanation.getSeverity() : healthState)
                    .summary(explanation.getSummary() != null ? explanation.getSummary() : "No abstract provided")
                    .rootCause(explanation.getRootCause() != null ? explanation.getRootCause() : "Undiagnosed sensory sequence")
                    .recommendedAction(explanation.getRecommendedAction() != null ? explanation.getRecommendedAction() : "Initiate manual intervention sequence")
                    .confidenceScore(explanation.getConfidenceScore() != null ? explanation.getConfidenceScore() : 0.85)
                    .build();

            repository.save(entity);
            log.info("Successfully persisted structured explanation schema output for anomaly on {}", vehicleId);
            
            // Optionally auto-embed document into pgvector store for future self-healing feedback cycles
            if (vectorStore != null) {
                try {
                    String embedContent = String.format("[%s] Vehicle %s dropped to %s due to: %s. Action taken: %s",
                            entity.getSeverity(), vehicleId, healthState, entity.getRootCause(), entity.getRecommendedAction());
                    vectorStore.add(List.of(new Document(embedContent)));
                } catch (Exception e) {
                    log.debug("Auto-embedding pipeline sequence deferred: {}", e.getMessage());
                }
            }

            return explanation;

        } catch (Exception e) {
            log.error("GenAI client prompt sequence failed: {}", e.getMessage(), e);
            // Fallback response POJO guarantee
            AnomalyExplanation fallback = AnomalyExplanation.builder()
                    .severity(healthState)
                    .summary("Automated GenAI diagnostic summary sequence unavailable. Review metrics directly.")
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
            repository.save(entity);
            return fallback;
        }
    }
}
