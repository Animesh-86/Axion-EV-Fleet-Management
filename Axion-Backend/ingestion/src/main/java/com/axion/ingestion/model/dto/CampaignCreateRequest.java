package com.axion.ingestion.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignCreateRequest {
    @NotBlank(message = "Target version is required")
    private String targetVersion;

    @NotEmpty(message = "At least one vehicle ID is required")
    private List<String> vehicleIds;

    private List<String> canaryVehicleIds; // 2-3 vehicles for canary deployment
}
