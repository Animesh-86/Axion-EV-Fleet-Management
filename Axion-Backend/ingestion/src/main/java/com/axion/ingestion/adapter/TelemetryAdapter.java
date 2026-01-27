package com.axion.ingestion.adapter;

import com.axion.ingestion.model.CanonicalTelemetryEnvelope;

public interface TelemetryAdapter {
    CanonicalTelemetryEnvelope adapt(String rawPayload);
}
