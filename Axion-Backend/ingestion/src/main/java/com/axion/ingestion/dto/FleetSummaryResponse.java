package com.axion.ingestion.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@RequiredArgsConstructor
@Getter
@Setter
public class FleetSummaryResponse {

    private long totalVehicles;
    private long onlineVehicles;
    private long healthy;
    private long degraded;
    private long critical;
}
