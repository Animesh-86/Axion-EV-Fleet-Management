package com.axion.ingestion.producer;

import com.axion.ingestion.exception.IngestionUnavailableException;
import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Component
@ConditionalOnProperty(prefix = "axion.kafka", name = "enabled", havingValue = "true", matchIfMissing = false)
public class TelemetryKafkaProducer implements TelemetryProducer {

    @Value("${axion.kafka.topic.telemetry}")
    private String topic;

    @Value("${axion.kafka.topic.telemetry-enriched:telemetry-enriched}")
    private String enrichedTopic;

    private final KafkaTemplate<String, CanonicalTelemetryEnvelope> kafkaTemplate;

    public TelemetryKafkaProducer(KafkaTemplate<String, CanonicalTelemetryEnvelope> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public java.util.concurrent.CompletableFuture<Void> publishAsync(CanonicalTelemetryEnvelope envelope) {
        final java.util.concurrent.CompletableFuture<Void> cf = new java.util.concurrent.CompletableFuture<>();
        Object sendFuture = kafkaTemplate.send(topic, envelope.getVehicleId(), envelope);

        // Support both ListenableFuture (older Spring Kafka) and CompletableFuture (newer APIs)
        if (sendFuture instanceof org.springframework.util.concurrent.ListenableFuture<?> lf) {
            @SuppressWarnings("unchecked")
            org.springframework.util.concurrent.ListenableFuture<org.springframework.kafka.support.SendResult<String, CanonicalTelemetryEnvelope>> listenable = (org.springframework.util.concurrent.ListenableFuture<org.springframework.kafka.support.SendResult<String, CanonicalTelemetryEnvelope>>) lf;
            listenable.addCallback(result -> cf.complete(null), ex -> cf.completeExceptionally(new IngestionUnavailableException("Kafka unavailable, telemetry not accepted", ex)));
        } else if (sendFuture instanceof java.util.concurrent.CompletableFuture<?> cfSend) {
            @SuppressWarnings("unchecked")
            java.util.concurrent.CompletableFuture<org.springframework.kafka.support.SendResult<String, CanonicalTelemetryEnvelope>> completable = (java.util.concurrent.CompletableFuture<org.springframework.kafka.support.SendResult<String, CanonicalTelemetryEnvelope>>) cfSend;
            completable.whenComplete((res, ex) -> {
                if (ex != null) {
                    cf.completeExceptionally(new IngestionUnavailableException("Kafka unavailable, telemetry not accepted", ex));
                } else {
                    cf.complete(null);
                }
            });
        } else {
            // Unknown future type — attempt best-effort handling
            cf.completeExceptionally(new IngestionUnavailableException("Kafka send returned unsupported future type: " + sendFuture.getClass()));
        }
        return cf;
    }

    public java.util.concurrent.CompletableFuture<Void> publishEnrichedAsync(CanonicalTelemetryEnvelope envelope) {
        final java.util.concurrent.CompletableFuture<Void> cf = new java.util.concurrent.CompletableFuture<>();
        Object sendFuture = kafkaTemplate.send(enrichedTopic, envelope.getVehicleId(), envelope);

        if (sendFuture instanceof org.springframework.util.concurrent.ListenableFuture<?> lf) {
            @SuppressWarnings("unchecked")
            org.springframework.util.concurrent.ListenableFuture<org.springframework.kafka.support.SendResult<String, CanonicalTelemetryEnvelope>> listenable = (org.springframework.util.concurrent.ListenableFuture<org.springframework.kafka.support.SendResult<String, CanonicalTelemetryEnvelope>>) lf;
            listenable.addCallback(result -> cf.complete(null), ex -> cf.completeExceptionally(new IngestionUnavailableException("Kafka unavailable, enriched telemetry not accepted", ex)));
        } else if (sendFuture instanceof java.util.concurrent.CompletableFuture<?> cfSend) {
            @SuppressWarnings("unchecked")
            java.util.concurrent.CompletableFuture<org.springframework.kafka.support.SendResult<String, CanonicalTelemetryEnvelope>> completable = (java.util.concurrent.CompletableFuture<org.springframework.kafka.support.SendResult<String, CanonicalTelemetryEnvelope>>) cfSend;
            completable.whenComplete((res, ex) -> {
                if (ex != null) {
                    cf.completeExceptionally(new IngestionUnavailableException("Kafka unavailable, enriched telemetry not accepted", ex));
                } else {
                    cf.complete(null);
                }
            });
        } else {
            cf.completeExceptionally(new IngestionUnavailableException("Kafka send returned unsupported future type: " + sendFuture.getClass()));
        }
        return cf;
    }
}
