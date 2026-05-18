-- Users & Authentication
CREATE TABLE users (
    id             VARCHAR(255) PRIMARY KEY,
    username       VARCHAR(50) UNIQUE NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    role           VARCHAR(20) NOT NULL,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    last_login     TIMESTAMPTZ
);

-- Vehicle Registry
CREATE TABLE vehicle_registry (
    vehicle_id       VARCHAR(50) PRIMARY KEY,
    display_name     VARCHAR(100),
    vehicle_profile  VARCHAR(50) NOT NULL DEFAULT 'sedan_standard',
    firmware_version VARCHAR(30) DEFAULT 'v1.0.0',
    lifecycle_state  VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    registered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at     TIMESTAMPTZ,
    registered_by    VARCHAR(100)
);

CREATE INDEX idx_vehicle_registry_state ON vehicle_registry (lifecycle_state);

-- OTA Campaign Tracking
CREATE TABLE ota_campaigns (
    campaign_id    VARCHAR(255) PRIMARY KEY,
    target_version VARCHAR(20) NOT NULL,
    status         VARCHAR(20) NOT NULL, -- DRAFT, CANARY, ROLLOUT, COMPLETED, HALTED
    created_by     VARCHAR(255),
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    completed_at   TIMESTAMPTZ
);

-- Individual OTA Jobs per Vehicle
CREATE TABLE ota_jobs (
    job_id       VARCHAR(255) PRIMARY KEY,
    campaign_id  VARCHAR(255) REFERENCES ota_campaigns(campaign_id),
    vehicle_id   VARCHAR(50) NOT NULL,
    state        VARCHAR(20) NOT NULL, -- PENDING, IN_PROGRESS, SUCCESS, FAILED, ROLLED_BACK
    is_canary    BOOLEAN DEFAULT FALSE,
    started_at   TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Vehicle Policies
CREATE TABLE vehicle_policies (
    vehicle_id          VARCHAR(50) PRIMARY KEY,
    max_temp_threshold  FLOAT DEFAULT 55.0,
    min_ota_battery     FLOAT DEFAULT 30.0,
    auto_exclude_ota    BOOLEAN DEFAULT FALSE
);

-- Audit Trail
CREATE TABLE audit_logs (
    log_id       BIGSERIAL PRIMARY KEY,
    actor        VARCHAR(100),
    action       VARCHAR(50),  -- TRIGGERED_OTA, HALTED_CAMPAIGN, LOGIN, etc.
    target       VARCHAR(100),
    details      JSONB,
    timestamp    TIMESTAMPTZ DEFAULT NOW()
);

-- Anomaly Explanations
CREATE TABLE anomaly_explanations (
    id VARCHAR(255) PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    severity VARCHAR(20) NOT NULL,
    summary TEXT NOT NULL,
    root_cause TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL
);

CREATE INDEX idx_anomaly_exp_vehicle ON anomaly_explanations(vehicle_id);
