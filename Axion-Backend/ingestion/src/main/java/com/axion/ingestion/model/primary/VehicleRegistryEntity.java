package com.axion.ingestion.model.primary;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Represents a registered vehicle in the fleet. Closes the architectural gap
 * where digital twins were created implicitly from unvalidated telemetry.
 * Now only provisioned vehicles can emit telemetry and appear on the dashboard.
 */
@Entity
@Table(name = "vehicle_registry")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class VehicleRegistryEntity {

    @Id
    @Column(name = "vehicle_id", length = 50)
    private String vehicleId;

    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(name = "vehicle_profile", length = 50, nullable = false)
    private String vehicleProfile;  // sedan_standard, truck_heavy, sedan_sport

    @Column(name = "firmware_version", length = 30)
    private String firmwareVersion;

    @Column(name = "lifecycle_state", length = 20, nullable = false)
    @Builder.Default
    private String lifecycleState = "ACTIVE";  // PROVISIONED, ACTIVE, MAINTENANCE, DECOMMISSIONED

    @Column(name = "registered_at", nullable = false)
    @Builder.Default
    private Instant registeredAt = Instant.now();

    @Column(name = "last_seen_at")
    private Instant lastSeenAt;

    @Column(name = "registered_by", length = 100)
    private String registeredBy;
}
