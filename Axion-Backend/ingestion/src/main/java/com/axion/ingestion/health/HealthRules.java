package com.axion.ingestion.health;

public final class HealthRules {

    private HealthRules() {
    }

    // Battery SOC
    public static final double SOC_CRITICAL = 15.0;
    public static final double SOC_WARNING = 30.0;

    // Battery temperature (°C)
    public static final double BATTERY_TEMP_WARNING = 45.0;
    public static final double BATTERY_TEMP_CRITICAL = 55.0;

    // Connectivity
    public static final double PACKET_LOSS_WARNING = 5.0;
    public static final double PACKET_LOSS_CRITICAL = 10.0;

    // Scoring penalties
    public static final int PENALTY_WARNING = 30;
    public static final int PENALTY_CRITICAL = 60;
}
