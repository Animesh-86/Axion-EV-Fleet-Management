package com.axion.ingestion.model.primary;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ota_campaigns")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtaCampaignEntity {

    @Id
    @Column(name = "campaign_id")
    private String campaignId;

    @Column(name = "target_version", nullable = false)
    private String targetVersion;

    @Column(nullable = false)
    private String status; // DRAFT, CANARY, ROLLOUT, COMPLETED, HALTED

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<OtaJobEntity> jobs = new ArrayList<>();
}
