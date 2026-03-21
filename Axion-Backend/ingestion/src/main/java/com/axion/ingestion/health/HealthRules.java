package com.axion.ingestion.health;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class HealthRules {

    // Battery SOC
    @Value("${axion.health.soc-critical}")
    public double socCritical;

    @Value("${axion.health.soc-warning}")
    public double socWarning;

    // Battery temperature (°C)
    @Value("${axion.health.battery-temp-warning}")
    public double batteryTempWarning;

    @Value("${axion.health.battery-temp-critical}")
    public double batteryTempCritical;

    // Connectivity
    @Value("${axion.health.packet-loss-warning}")
    public double packetLossWarning;

    @Value("${axion.health.packet-loss-critical}")
    public double packetLossCritical;

    // Scoring penalties
    @Value("${axion.health.penalty-warning}")
    public int penaltyWarning;

    @Value("${axion.health.penalty-critical}")
    public int penaltyCritical;

    @Value("${axion.health.base-score}")
    public int baseScore;
}
