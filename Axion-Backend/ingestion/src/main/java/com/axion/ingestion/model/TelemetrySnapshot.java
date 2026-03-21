package com.axion.ingestion.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class TelemetrySnapshot {

    private Double speedKmph;
    private Double batterySocPct;
    private Double batteryTempC;
    private Double motorTempC;
    private Double ambientTempC;
    private Double odometerKm;
}
