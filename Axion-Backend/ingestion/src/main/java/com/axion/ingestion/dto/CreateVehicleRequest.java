package com.axion.ingestion.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class CreateVehicleRequest {
    private String id;
    private String profile;
    private String scenario;
    private Boolean registerWithSimulator = true;
}
