package com.axion.ingestion.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@RequiredArgsConstructor
@Getter
@Setter
public class DigitalTwinResponse {

    private String vehicleId;
    private Boolean online;
    private Instant lastSeen;

    private Integer healthScore;
    private String healthState;

    private Object telemetry;
}
