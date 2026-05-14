package com.axion.ingestion.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Unified timeline event used by the Root Cause Analysis engine.
 * Merges events from TimescaleDB telemetry, OTA campaigns, and audit logs.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RcaEvent {
    private Instant timestamp;
    private String category;    // TELEMETRY, HEALTH, OTA, ALERT
    private String severity;    // INFO, WARNING, CRITICAL
    private String title;
    private String detail;
    private String vehicleId;
}
