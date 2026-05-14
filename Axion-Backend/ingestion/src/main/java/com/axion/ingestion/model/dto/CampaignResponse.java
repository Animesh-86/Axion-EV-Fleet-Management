package com.axion.ingestion.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignResponse {
    private String campaignId;
    private String targetVersion;
    private String status;
    private String createdBy;
    private Instant createdAt;
    private Instant completedAt;
    private int totalJobs;
    private int successJobs;
    private int failedJobs;
    private int pendingJobs;
    private double progress; // 0.0 - 1.0
    private List<JobResponse> jobs;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobResponse {
        private String jobId;
        private String vehicleId;
        private String state;
        private boolean canary;
        private Instant startedAt;
        private Instant completedAt;
    }
}
