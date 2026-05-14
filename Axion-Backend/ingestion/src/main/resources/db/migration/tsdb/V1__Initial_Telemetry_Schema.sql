CREATE TABLE telemetry_history (
    time            TIMESTAMPTZ NOT NULL,
    vehicle_id      VARCHAR(50) NOT NULL,
    battery_soc     FLOAT,
    battery_temp    FLOAT,
    motor_temp      FLOAT,
    speed           FLOAT,
    health_score    INTEGER,
    health_state    VARCHAR(20)
);

-- Converts table into an optimized time-series hypertable
SELECT create_hypertable('telemetry_history', 'time', if_not_exists => TRUE);

-- Index for fast vehicle-specific queries
CREATE INDEX idx_vehicle_time ON telemetry_history (vehicle_id, time DESC);
