package com.axion.ingestion.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelemetryHistory {
    private Instant time;
    private String vehicleId;
    private Double batterySoc;
    private Double batteryTemp;
    private Double motorTemp;
    private Double speed;
    private Integer healthScore;
    private String healthState;
}
