package com.axion.fleet.validation;

import com.axion.fleet.model.CanonicalTelemetryEnvelope;
import com.axion.fleet.model.TelemetryPayload;

public class TelemetryValidator {

    public void validate(CanonicalTelemetryEnvelope envelope) {

        if (envelope == null) {
            throw new IllegalArgumentException("Telemetry envelope cannot be null");
        }

        if (envelope.getVehicleId() == null || envelope.getVehicleId().isBlank()) {
            throw new IllegalArgumentException("vehicle_id is required");
        }

        if (envelope.getTimestamp() == null) {
            throw new IllegalArgumentException("timestamp is required");
        }

        TelemetryPayload telemetry = envelope.getTelemetry();

        if (telemetry == null) {
            throw new IllegalArgumentException("telemetry payload is required");
        }

        if (telemetry.getBatterySocPct() == null) {
            throw new IllegalArgumentException("battery_soc_pct is required");
        }
    }
}

