package com.axion.ingestion.model.primary;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "ota_jobs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtaJobEntity {

    @Id
    @Column(name = "job_id")
    private String jobId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private OtaCampaignEntity campaign;

    @Column(name = "vehicle_id", nullable = false)
    private String vehicleId;

    @Column(nullable = false)
    private String state; // PENDING, IN_PROGRESS, SUCCESS, FAILED, ROLLED_BACK

    @Column(name = "is_canary")
    @Builder.Default
    private boolean canary = false;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;
}
