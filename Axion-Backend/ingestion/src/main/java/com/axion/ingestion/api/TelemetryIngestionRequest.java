package com.axion.ingestion.api;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Raw telemetry payload sent by a vehicle or simulator")
public class TelemetryIngestionRequest {

    @Schema(
            description = "Vendor-specific telemetry JSON payload",
            example = """
        {
          "vehicle_id": "EV-001",
          "timestamp": "2026-01-25T18:32:45Z",
          "battery_soc_pct": 78.5,
          "speed_kmph": 64.2
        }
        """
    )
    private String payload;

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }
}
