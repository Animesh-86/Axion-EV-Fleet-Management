package com.axion.fleet.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RequiredArgsConstructor
@Getter
@Setter
public class TelemetryPayload {

    private Double speedKmph;
    private Double batterySocPct;
    private Double batteryTempC;
    private Double ambientTempC;
    private Double odometerKm;
}
