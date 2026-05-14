CREATE TABLE IF NOT EXISTS anomaly_explanations (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    severity VARCHAR(20) NOT NULL,
    summary TEXT NOT NULL,
    root_cause TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_anomaly_exp_vehicle ON anomaly_explanations(vehicle_id);
