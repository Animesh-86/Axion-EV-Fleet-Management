package com.axion.ingestion.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@RequiredArgsConstructor
@Getter
@Setter
public class DigitalTwinState {

    private String vehicleId;
    private String vendor;

    private Instant lastSeen;

    private boolean online;

    private TelemetrySnapshot telemetry;

    private Integer healthScore;

    private String healthState;

}
