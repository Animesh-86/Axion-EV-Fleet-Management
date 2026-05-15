
export interface FleetSummary {
  totalVehicles: number;
  onlineVehicles: number;
  healthy: number;
  degraded: number;
  critical: number;
  eventsPerSecond: number;
  totalEventsProcessed: number;
  predictedCritical?: number;
}

export interface FleetVehicle {
  vehicleId: string;
  vendor: string;
  online: boolean;
  healthScore: number;
  healthState: string;
  lastSeen: string;
  battery: number;
  temperature: number;
}

export interface TelemetryEvent {
  timestamp: string;
  type: string;
  event: string;
  newValue: string;
  oldValue?: string;
}

export interface TelemetrySnapshot {
  batterySocPct?: number;
  speedKmph?: number;
  batteryTempC?: number;
  motorTempC?: number;
  ambientTempC?: number;
  odometerKm?: number;
}

export interface BatteryPrediction {
  hours: number;
  confidence: number;
}

export interface TempAnomalyPrediction {
  risk: string;
  predictedPeakC: number;
}

export interface VehiclePredictions {
  batteryDepletion: BatteryPrediction;
  tempAnomaly: TempAnomalyPrediction;
}

export interface FleetRiskItem {
  vehicleId: string;
  riskScore: number;
}

export interface VehicleDetail extends FleetVehicle {
  telemetry: TelemetrySnapshot;
  predictions?: VehiclePredictions;
}

export interface TelemetryHistory {
  time: string;
  vehicleId: string;
  batterySoc: number;
  batteryTemp: number;
  motorTemp: number;
  speed: number;
  healthScore: number;
  healthState: string;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Use HttpOnly cookie for auth; include credentials so cookie is sent.
  const headers = new Headers(options.headers || {});
  return fetch(url, { ...options, headers, credentials: 'include' });
}

export class AxionApi {

  static async getFleetSummary(): Promise<FleetSummary> {
    const res = await fetchWithAuth(`${BASE_URL}/api/v1/fleet/summary`);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return res.json();
  }

  static async getFleetVehicles(): Promise<FleetVehicle[]> {
    const res = await fetchWithAuth(`${BASE_URL}/api/v1/fleet/vehicles`);
    if (!res.ok) throw new Error('Failed to fetch vehicles');
    return res.json();
  }

  static async getVehicle(vehicleId: string): Promise<VehicleDetail> {
    const res = await fetchWithAuth(`${BASE_URL}/api/v1/vehicles/${vehicleId}`);
    if (!res.ok) throw new Error('Failed to fetch vehicle');
    return res.json();
  }

  static async triggerOTA(campaignId: string, vehicleId: string) {
    const params = new URLSearchParams({ campaignId, vehicleId });
    const res = await fetchWithAuth(`${BASE_URL}/api/v1/ota/trigger?${params}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to trigger OTA');
    return res.json();
  }

  static async getHistory(vehicleId: string, from: string, to: string): Promise<TelemetryHistory[]> {
    const params = new URLSearchParams({ from, to });
    const res = await fetchWithAuth(`${BASE_URL}/api/v1/history/${vehicleId}?${params}`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  }

  static async getHistoryAggregates(vehicleId: string, interval: string = '1h'): Promise<TelemetryHistory[]> {
    const params = new URLSearchParams({ interval });
    const res = await fetchWithAuth(`${BASE_URL}/api/v1/history/${vehicleId}/aggregates?${params}`);
    if (!res.ok) throw new Error('Failed to fetch history aggregates');
    return res.json();
  }

  static async getFleetRiskRanking(): Promise<FleetRiskItem[]> {
    const ML_BASE = import.meta.env.VITE_ML_BASE_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${ML_BASE}/ml/v1/fleet/risk-ranking`);
    if (!res.ok) throw new Error('Failed to fetch risk ranking');
    return res.json();
  }

  static async triggerRetraining(): Promise<{ status: string }> {
    const ML_BASE = import.meta.env.VITE_ML_BASE_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${ML_BASE}/ml/v1/retrain`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to trigger retraining');
    return res.json();
  }

  // ──── OTA Campaign API ────

  static async createCampaign(data: CampaignCreateRequest): Promise<CampaignResponse> {
    const res = await fetchWithAuth(`${BASE_URL}/api/v1/ota/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create campaign');
    return res.json();
  }

  static async listCampaigns(): Promise<CampaignResponse[]> {
    const res = await fetchWithAuth(`${BASE_URL}/api/v1/ota/campaigns`);
    if (!res.ok) throw new Error('Failed to list campaigns');
    return res.json();
  }

  static async getCampaign(campaignId: string): Promise<CampaignResponse> {
    const res = await fetchWithAuth(`${BASE_URL}/api/v1/ota/campaigns/${campaignId}`);
    if (!res.ok) throw new Error('Failed to fetch campaign');
    return res.json();
  }

  static async approveCampaign(campaignId: string): Promise<CampaignResponse> {
    const res = await fetchWithAuth(`${BASE_URL}/api/v1/ota/campaigns/${campaignId}/approve`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to approve campaign');
    return res.json();
  }

  static async haltCampaign(campaignId: string): Promise<CampaignResponse> {
    const res = await fetchWithAuth(`${BASE_URL}/api/v1/ota/campaigns/${campaignId}/halt`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to halt campaign');
    return res.json();
  }

  // ──── Root Cause Analysis API ────

  static async getRcaTimeline(vehicleId: string, from?: string, to?: string): Promise<RcaEvent[]> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchWithAuth(`${BASE_URL}/api/v1/rca/${encodeURIComponent(vehicleId)}${query}`);
    if (!res.ok) throw new Error('Failed to fetch RCA timeline');
    return res.json();
  }

  // ──── GenAI Fleet Intelligence API ────

  static async getExplanations(vehicleId: string): Promise<AnomalyExplanation[]> {
    const res = await fetchWithAuth(`${BASE_URL}/api/v1/ai/explanations/${encodeURIComponent(vehicleId)}`);
    if (!res.ok) throw new Error('Failed to fetch AI explanations');
    return res.json();
  }
}


// ──── OTA Campaign Types ────

export interface CampaignCreateRequest {
  targetVersion: string;
  vehicleIds: string[];
  canaryVehicleIds: string[];
}

export interface CampaignJobResponse {
  jobId: string;
  vehicleId: string;
  state: string;
  canary: boolean;
  startedAt?: string;
  completedAt?: string;
}

export interface CampaignResponse {
  campaignId: string;
  targetVersion: string;
  status: string;
  createdBy?: string;
  createdAt: string;
  completedAt?: string;
  totalJobs: number;
  successJobs: number;
  failedJobs: number;
  pendingJobs: number;
  progress: number;
  jobs: CampaignJobResponse[];
}

export interface RcaEvent {
  timestamp: string;
  category: 'TELEMETRY' | 'HEALTH' | 'OTA' | 'ALERT';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  detail: string;
  vehicleId: string;
}

export interface AnomalyExplanation {
  id: string;
  vehicleId: string;
  createdAt: string;
  severity: string;
  summary: string;
  rootCause: string;
  recommendedAction: string;
  confidenceScore: number;
}


