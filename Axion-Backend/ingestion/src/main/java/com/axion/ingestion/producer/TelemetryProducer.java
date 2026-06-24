package com.axion.ingestion.producer;

import com.axion.ingestion.model.CanonicalTelemetryEnvelope;

public interface TelemetryProducer {

    java.util.concurrent.CompletableFuture<Void> publishAsync(CanonicalTelemetryEnvelope envelope);

    java.util.concurrent.CompletableFuture<Void> publishEnrichedAsync(CanonicalTelemetryEnvelope envelope);
}
