export interface Vehicle {
  id: string;
  vendor: string;
  model: string;
  battery: number;
  temperature: number;
  healthScore: number;
  status: 'online' | 'offline';
  otaEligible: boolean;
  speed: number;
  lastUpdate: Date;
  connectionQuality: 'excellent' | 'good' | 'poor';
  location: string;
}

export interface OTACampaign {
  id: string;
  name: string;
  targetFleet: number;
  progress: number;
  status: 'running' | 'paused' | 'completed' | 'rolled-back';
  version: string;
  vehicles: number;
  startedAt: Date;
  canaryProgress?: number;
}

export interface TelemetryEvent {
  id: string;
  vehicleId: string;
  type: 'battery' | 'temperature' | 'speed' | 'connection' | 'alert';
  message: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'critical';
}

export interface FleetStats {
  totalVehicles: number;
  onlineVehicles: number;
  averageHealth: number;
  activeCampaigns: number;
}
