package com.axion.ingestion.model.dto;

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
    private String targetVersion;
    private List<String> vehicleIds;
    private List<String> canaryVehicleIds; // 2-3 vehicles for canary deployment
}
