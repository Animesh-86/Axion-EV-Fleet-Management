package com.axion.ingestion.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class CreateVehicleRequest {
    @NotBlank(message = "Vehicle id is required")
    private String id;

    private String profile;
    private String scenario;
    private Boolean registerWithSimulator = true;
}
