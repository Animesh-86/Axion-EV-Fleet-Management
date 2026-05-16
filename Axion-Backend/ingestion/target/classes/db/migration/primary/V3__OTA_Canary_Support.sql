-- Add canary flag to ota_jobs for canary deployment support
ALTER TABLE ota_jobs ADD COLUMN IF NOT EXISTS is_canary BOOLEAN DEFAULT FALSE;

-- Change job_id and campaign_id to VARCHAR to match JPA String type
ALTER TABLE ota_campaigns ALTER COLUMN campaign_id TYPE VARCHAR(255);
ALTER TABLE ota_jobs ALTER COLUMN job_id TYPE VARCHAR(255);
ALTER TABLE ota_jobs ALTER COLUMN campaign_id TYPE VARCHAR(255);
