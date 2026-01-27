package com.axion.ota.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.List;

@RequiredArgsConstructor
@Getter
@Setter
public class OtaCampaign {

    private String campaignId;
    private String version;
    private List<String> vehicleIds;
}
