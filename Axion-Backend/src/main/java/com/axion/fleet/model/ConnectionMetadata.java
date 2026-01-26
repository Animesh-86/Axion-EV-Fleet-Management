package com.axion.fleet.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RequiredArgsConstructor
@Getter
@Setter
public class ConnectionMetadata {

    private String protocol;
    private Integer signalStrength;
    private Long sequenceNumber;
    private Double packetLossPct;
    private Boolean isHeartbeat;
}
