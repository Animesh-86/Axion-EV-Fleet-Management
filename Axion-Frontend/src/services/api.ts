
export interface FleetSummary {
  totalVehicles: number;
  onlineVehicles: number;
  healthy: number;
  degraded: number;
  critical: number;
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

export interface VehicleDetail extends FleetVehicle {
  telemetry: TelemetrySnapshot;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export class AxionApi {

  static async getFleetSummary(): Promise<FleetSummary> {
    const res = await fetch(`${BASE_URL}/api/v1/fleet/summary`);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return res.json();
  }

  static async getFleetVehicles(): Promise<FleetVehicle[]> {
    const res = await fetch(`${BASE_URL}/api/v1/fleet/vehicles`);
    if (!res.ok) throw new Error('Failed to fetch vehicles');
    return res.json();
  }

  static async getVehicle(vehicleId: string): Promise<VehicleDetail> {
    const res = await fetch(`${BASE_URL}/api/v1/fleet/${vehicleId}`);
    if (!res.ok) throw new Error('Failed to fetch vehicle');
    return res.json();
  }

  static async triggerOTA(campaignId: string, vehicleId: string) {
    const params = new URLSearchParams({ campaignId, vehicleId });
    const res = await fetch(`${BASE_URL}/api/v1/ota/trigger?${params}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to trigger OTA');
    return res.json();
  }
}
