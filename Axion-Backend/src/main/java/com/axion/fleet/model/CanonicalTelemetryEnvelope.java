package com.axion.fleet.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@RequiredArgsConstructor
@Getter
@Setter
public class CanonicalTelemetryEnvelope {

    private String schemaVersion;
    private String vehicleId;
    private String vendor;

    private Instant timestamp;
    private Instant ingestionTs;

    private TelemetryPayload telemetry;
    private ConnectionMetadata connection;
}
