-- Users & Authentication
CREATE TABLE users (
    user_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username   VARCHAR(50) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,  -- BCrypt hash
    role       VARCHAR(20) NOT NULL,   -- ADMIN, OPERATOR
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OTA Campaign Tracking (persistent, not in-memory)
CREATE TABLE ota_campaigns (
    campaign_id    UUID PRIMARY KEY,
    target_version VARCHAR(20) NOT NULL,
    status         VARCHAR(20) NOT NULL, -- DRAFT, CANARY, ROLLOUT, COMPLETED, HALTED
    created_by     UUID REFERENCES users(user_id),
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    completed_at   TIMESTAMPTZ
);

-- Individual OTA Jobs per Vehicle
CREATE TABLE ota_jobs (
    job_id       UUID PRIMARY KEY,
    campaign_id  UUID REFERENCES ota_campaigns(campaign_id),
    vehicle_id   VARCHAR(50) NOT NULL,
    state        VARCHAR(20) NOT NULL, -- PENDING, IN_PROGRESS, SUCCESS, FAILED, ROLLED_BACK
    started_at   TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Vehicle Policies (configurable thresholds per vehicle)
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
