-- Vehicle Registry: Device provisioning and lifecycle management.
-- Closes the architectural gap where digital twins were created
-- implicitly from unvalidated telemetry payloads.

CREATE TABLE IF NOT EXISTS vehicle_registry (
    vehicle_id       VARCHAR(50) PRIMARY KEY,
    display_name     VARCHAR(100),
    vehicle_profile  VARCHAR(50) NOT NULL DEFAULT 'sedan_standard',
    firmware_version VARCHAR(30) DEFAULT 'v1.0.0',
    lifecycle_state  VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    registered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at     TIMESTAMPTZ,
    registered_by    VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_vehicle_registry_state ON vehicle_registry (lifecycle_state);
