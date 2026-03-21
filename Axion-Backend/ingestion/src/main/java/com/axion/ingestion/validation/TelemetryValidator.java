package com.axion.ingestion.validation;

import com.axion.ingestion.exception.ValidationException;
import com.axion.ingestion.model.CanonicalTelemetryEnvelope;



public class TelemetryValidator {

    public void validate(CanonicalTelemetryEnvelope envelope) {

        if (envelope == null) {
            throw new ValidationException("Telemetry envelope is missing");
        }

        if (envelope.getVehicleId() == null || envelope.getVehicleId().isBlank()) {
            throw new ValidationException("vehicle_id is required");
        }

        if (envelope.getTimestamp() == null) {
            throw new ValidationException("timestamp is required");
        }

        if (envelope.getTelemetry() == null ||
                envelope.getTelemetry().getBatterySocPct() == null) {
            throw new ValidationException("battery_soc_pct is required");
        }
    }
}