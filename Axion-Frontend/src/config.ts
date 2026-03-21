// Centralized configuration constants for the Axion frontend.
// All polling intervals, thresholds, and display values are defined here
// instead of being hardcoded in individual components.

// ── Polling Intervals (ms) ─────────────────────────
export const POLL_DASHBOARD = 3000;
export const POLL_VEHICLE_DETAIL = 3000;
export const POLL_VEHICLE_LIST = 3000;
export const POLL_ANALYTICS = 5000;
export const POLL_HEALTH_CHECK = 5000;
export const POLL_OTA = 5000;
export const POLL_ALERTS = 5000;
export const POLL_SYSTEM_HEALTH = 5000;

// ── UI Animation ───────────────────────────────────
export const COUNTER_ANIMATION_DURATION = 2000;

// ── Telemetry ──────────────────────────────────────
export const TELEMETRY_HISTORY_WINDOW = 20;
export const HEALTH_HISTORY_WINDOW = 30;

// ── Infrastructure Ports (display only) ────────────
export const PORTS = {
  BACKEND: 8080,
  REDIS: 6379,
  KAFKA: 9092,
  MQTT: 1883,
  ZOOKEEPER: 2181,
} as const;

// ── Health Scoring (display only — source of truth is backend) ──
export const HEALTH = {
  BASE_SCORE: 100,
  SOC_CRITICAL_PCT: 15,
  SOC_WARNING_PCT: 30,
  TEMP_WARNING_C: 45,
  TEMP_CRITICAL_C: 55,
  PENALTY_WARNING: 30,
  PENALTY_CRITICAL: 60,
  REDIS_TTL_SECONDS: 120,
} as const;

// ── OTA ────────────────────────────────────────────
export const DEFAULT_CAMPAIGN_ID = 'campaign-001';
