package com.axion.ingestion.producer;

import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "axion.kafka", name = "enabled", havingValue = "false", matchIfMissing = false)
public class NoopTelemetryProducer implements TelemetryProducer {

    @Override
    public java.util.concurrent.CompletableFuture<Void> publishAsync(CanonicalTelemetryEnvelope envelope) {
        return java.util.concurrent.CompletableFuture.completedFuture(null);
    }

    @Override
    public java.util.concurrent.CompletableFuture<Void> publishEnrichedAsync(CanonicalTelemetryEnvelope envelope) {
        return java.util.concurrent.CompletableFuture.completedFuture(null);
    }
}
