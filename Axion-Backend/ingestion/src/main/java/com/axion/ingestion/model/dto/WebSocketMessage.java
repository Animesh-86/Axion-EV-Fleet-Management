package com.axion.ingestion.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketMessage {
    private String type; // TWIN_UPDATE, HEALTH_CHANGE, OTA_STATUS, ALERT
    private String vehicleId;
    private Object data;
    private String from;
    private String to;
    private String severity;
    private String message;
}
