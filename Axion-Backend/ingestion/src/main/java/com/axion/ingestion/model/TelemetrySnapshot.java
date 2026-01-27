package com.axion.ingestion.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RequiredArgsConstructor
@Getter
@Setter
public class TelemetrySnapshot {

    private Double speedKmph;
    private Double batterySocPct;
    private Double batteryTempC;
    private Double motorTempC;
    private Double ambientTempC;
    private double odometerkm;
}
