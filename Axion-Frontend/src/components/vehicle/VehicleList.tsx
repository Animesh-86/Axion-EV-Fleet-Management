import { motion } from 'motion/react';
import { Activity, WifiOff, ExternalLink, Battery, Thermometer, TrendingUp } from 'lucide-react';

interface VehicleListProps {
  onSelectVehicle: (id: string) => void;
}

interface Vehicle {
  id: string;
  vendor: string;
  battery: number;
  temperature: number;
  healthScore: number;
  status: 'online' | 'offline';
  lastUpdate: string;
  degradationDrivers?: Array<{ label: string; trend: 'up' | 'down' }>;
}

const mockVehicles: Vehicle[] = [
  { id: 'EV-001', vendor: 'Tesla-like', battery: 87, temperature: 23, healthScore: 95, status: 'online', lastUpdate: '2s ago' },
  { 
    id: 'EV-002', 
    vendor: 'Tata-like', 
    battery: 42, 
    temperature: 31, 
    healthScore: 68, 
    status: 'online', 
    lastUpdate: '5s ago',
    degradationDrivers: [
      { label: 'Temp Instability', trend: 'up' },
      { label: 'Battery Drain', trend: 'up' }
    ]
  },
  { id: 'EV-003', vendor: 'Tesla-like', battery: 91, temperature: 21, healthScore: 98, status: 'online', lastUpdate: '1s ago' },
  { 
    id: 'EV-004', 
    vendor: 'Tata-like', 
    battery: 15, 
    temperature: 38, 
    healthScore: 45, 
    status: 'offline', 
    lastUpdate: '2m ago',
    degradationDrivers: [
      { label: 'Critical Battery', trend: 'up' },
      { label: 'Overheating', trend: 'up' }
    ]
  },
  { id: 'EV-005', vendor: 'Tesla-like', battery: 73, temperature: 25, healthScore: 88, status: 'online', lastUpdate: '3s ago' },
  { id: 'EV-006', vendor: 'Tata-like', battery: 58, temperature: 28, healthScore: 76, status: 'online', lastUpdate: '7s ago' },
  { id: 'EV-007', vendor: 'Tesla-like', battery: 96, temperature: 19, healthScore: 99, status: 'online', lastUpdate: '1s ago' },
  { 
    id: 'EV-008', 
    vendor: 'Tata-like', 
    battery: 34, 
    temperature: 35, 
    healthScore: 52, 
    status: 'offline', 
    lastUpdate: '5m ago',
    degradationDrivers: [
      { label: 'Low Battery', trend: 'up' },
      { label: 'Temp Spikes', trend: 'up' }
    ]
  },
  { id: 'EV-009', vendor: 'Tesla-like', battery: 82, temperature: 24, healthScore: 92, status: 'online', lastUpdate: '4s ago' },
  { id: 'EV-010', vendor: 'Tata-like', battery: 67, temperature: 27, healthScore: 81, status: 'online', lastUpdate: '2s ago' },
];

export function VehicleList({ onSelectVehicle }: VehicleListProps) {
  const getHealthStatus = (score: number): { label: string; color: string; glow: string } => {
    if (score >= 80) return { 
      label: 'Healthy', 
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'shadow-emerald-500/20'
    };
    if (score >= 60) return { 
      label: 'Warning', 
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'shadow-amber-500/20'
    };
    return { 
      label: 'Critical', 
      color: 'bg-red-500/10 text-red-400 border-red-500/20',
      glow: 'shadow-red-500/30 animate-pulse'
    };
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return 'bg-emerald-500';
    if (battery > 20) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Fleet Vehicles</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor and manage all vehicles • {mockVehicles.filter(v => v.status === 'online').length} online
        </p>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 gap-3">
        {mockVehicles.map((vehicle, index) => {
          const healthStatus = getHealthStatus(vehicle.healthScore);
          const batteryColor = getBatteryColor(vehicle.battery);

          return (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ 
                scale: 1.005,
                backgroundColor: 'rgba(0, 229, 255, 0.03)',
                transition: { duration: 0.2 }
              }}
              onClick={() => onSelectVehicle(vehicle.id)}
              className="bg-card border border-border rounded-lg p-5 cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 group"
            >
              <div className="flex items-center justify-between">
                {/* Left: Vehicle Info */}
                <div className="flex items-center gap-6 flex-1">
                  {/* Vehicle ID */}
                  <div className="min-w-[100px]">
                    <p className="text-sm font-mono text-primary font-semibold">{vehicle.id}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{vehicle.vendor}</p>
                  </div>

                  {/* Battery */}
                  <div className="min-w-[140px]">
                    <div className="flex items-center gap-2 mb-1">
                      <Battery className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Battery</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${vehicle.battery}%` }}
                          transition={{ delay: index * 0.05 + 0.3, duration: 0.8 }}
                          className={`h-full ${batteryColor}`}
                        />
                      </div>
                      <span className="text-sm font-semibold w-12 text-right">{vehicle.battery}%</span>
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="min-w-[120px]">
                    <div className="flex items-center gap-2 mb-1">
                      <Thermometer className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Temp</span>
                    </div>
                    <p className="text-sm font-semibold">
                      {vehicle.temperature}°C
                    </p>
                  </div>

                  {/* Health Score */}
                  <div className="min-w-[200px]">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
                      Health
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${healthStatus.color} ${healthStatus.glow} shadow-lg`}>
                        {healthStatus.label} • {vehicle.healthScore}
                      </span>
                      {vehicle.degradationDrivers && (
                        <div className="flex items-center gap-1">
                          {vehicle.degradationDrivers.map((driver, driverIndex) => (
                            <span
                              key={driverIndex}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-xs font-medium"
                            >
                              {driver.label}
                              <TrendingUp className="w-3 h-3" />
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="min-w-[100px]">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
                      Status
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                        vehicle.status === 'online'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}
                    >
                      {vehicle.status === 'online' ? (
                        <>
                          <Activity className="w-3 h-3" />
                          Online
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-3 h-3" />
                          Offline
                        </>
                      )}
                    </span>
                  </div>

                  {/* Last Update */}
                  <div className="min-w-[80px]">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
                      Updated
                    </span>
                    <p className="text-xs font-medium text-muted-foreground">{vehicle.lastUpdate}</p>
                  </div>
                </div>

                {/* Right: Action */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors">
                    <span>View Digital Twin</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          Showing {mockVehicles.length} vehicles
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-muted-foreground">
              {mockVehicles.filter(v => v.healthScore >= 80).length} Healthy
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            <span className="text-muted-foreground">
              {mockVehicles.filter(v => v.healthScore >= 60 && v.healthScore < 80).length} Warning
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-muted-foreground">
              {mockVehicles.filter(v => v.healthScore < 60).length} Critical
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}