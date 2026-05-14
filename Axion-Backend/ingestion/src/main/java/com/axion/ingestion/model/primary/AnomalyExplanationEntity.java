package com.axion.ingestion.model.primary;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "anomaly_explanations")
public class AnomalyExplanationEntity {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "vehicle_id", nullable = false, length = 50)
    private String vehicleId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "severity", nullable = false, length = 20)
    private String severity;

    @Column(name = "summary", nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(name = "root_cause", nullable = false, columnDefinition = "TEXT")
    private String rootCause;

    @Column(name = "recommended_action", nullable = false, columnDefinition = "TEXT")
    private String recommendedAction;

    @Column(name = "confidence_score", nullable = false)
    private Double confidenceScore;
}
