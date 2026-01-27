package com.axion.ingestion.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RequiredArgsConstructor
@Getter
@Setter
public class ConnectionMetadata {

    private String protocol;          // REST / MQTT
    private Integer signalStrength;    // dBm
    private Long sequenceNumber;
    private Double packetLossPct;
    private Boolean isHeartbeat;

    // getters & setters
}
