package com.axion.fleet.adapter;

import com.axion.fleet.model.CanonicalTelemetryEnvelope;

public interface TelemetryAdapter {
    CanonicalTelemetryEnvelope adapt(String rawPayload);
}
