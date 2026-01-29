package com.axion.ingestion.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class FleetVehicleResponse {

    private String vehicleId;
    private String vendor;
    private boolean online;
    private Integer healthScore;
    private String healthState;
    private Instant lastSeen;
    private Double battery;
    private Double temperature;
}
