package com.axion.ota.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@RequiredArgsConstructor
@Getter
@Setter
public class OtaJob {

    private String jobId;
    private String campaignId;
    private String vehicleId;

    private OtaState state;
    private Instant startedAt;
    private Instant completedAt;

}
