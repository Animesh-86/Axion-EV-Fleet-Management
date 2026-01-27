package com.axion.fleet.validation;

import com.axion.fleet.exception.ValidationException;
import com.axion.fleet.model.CanonicalTelemetryEnvelope;
import com.axion.fleet.model.TelemetryPayload;

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

        TelemetryPayload telemetry = envelope.getTelemetry();

        if (telemetry == null) {
            throw new ValidationException("telemetry payload is required");
        }

        if (envelope.getTelemetry().getBatterySocPct() == null) {
            throw new ValidationException("battery_soc_pct is required");
        }
    }
}

