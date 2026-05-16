import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Activity, WifiOff, ExternalLink, Battery, Thermometer, TrendingUp, Search, X } from 'lucide-react';
import { AxionApi, FleetVehicle } from '../../services/api';
import { POLL_VEHICLE_LIST, HEALTH } from '../../config';
import { LAST_VEHICLE_STORAGE_KEY, paths } from '../../constants/navigation';

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

export function VehicleList() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const getDegradationDrivers = (v: FleetVehicle): Array<{ label: string; trend: 'up' | 'down' }> | undefined => {
    const drivers: Array<{ label: string; trend: 'up' | 'down' }> = [];
    if (v.battery != null && v.battery < HEALTH.SOC_WARNING_PCT) drivers.push({ label: v.battery < HEALTH.SOC_CRITICAL_PCT ? 'SOC_CRITICAL' : 'LOW_BATT', trend: 'down' });
    if (v.temperature != null && v.temperature > HEALTH.TEMP_WARNING_C) drivers.push({ label: v.temperature > HEALTH.TEMP_CRITICAL_C ? 'THERMAL_CRIT' : 'HIGH_TEMP', trend: 'up' });
    if (!v.online) drivers.push({ label: 'OFFLINE', trend: 'down' });
    return drivers.length > 0 ? drivers : undefined;
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await AxionApi.getFleetVehicles();
        const mapped: Vehicle[] = data.map((v: FleetVehicle) => ({
          id: v.vehicleId,
          vendor: v.vendor || 'Unknown',
          battery: v.battery || 0,
          temperature: v.temperature || 0,
          healthScore: v.healthScore || 100,
          status: v.online ? 'online' : 'offline',
          lastUpdate: new Date(v.lastSeen).toLocaleTimeString(),
          degradationDrivers: getDegradationDrivers(v),
        }));
        setVehicles(mapped);
      } catch (err) {
        console.error("Failed to fetch vehicles", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
    const interval = setInterval(fetchVehicles, POLL_VEHICLE_LIST);
    return () => clearInterval(interval);
  }, []);

  const getHealthStatus = (score: number): { label: string; color: string; glow: string } => {
    if (score >= (HEALTH.BASE_SCORE - HEALTH.PENALTY_WARNING)) return {
      label: 'OPTIMAL',
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]'
    };
    if (score >= (HEALTH.BASE_SCORE - HEALTH.PENALTY_CRITICAL)) return {
      label: 'DEGRADED',
      color: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]'
    };
    return {
      label: 'CRITICAL',
      color: 'text-red-400 border-red-500/20 bg-red-500/5',
      glow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse'
    };
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mb-4" />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Synchronizing Fleet Data...</p>
      </div>
    );
  }

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredVehicles = normalizedSearch
    ? vehicles.filter((vehicle) => {
        return [vehicle.id, vehicle.vendor, vehicle.status, vehicle.healthScore.toString()]
          .some((value) => value.toLowerCase().includes(normalizedSearch));
      })
    : vehicles;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-precision">Fleet_Inventory</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mt-2 opacity-50">
             Active Orchestration Layer • {vehicles.filter(v => v.status === 'online').length} Nodes Online
          </p>
        </div>

        <div className="w-full max-w-xl">
          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/50">
            Search vehicles
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 shadow-lg shadow-black/10 backdrop-blur-xl">
            <Search className="h-4 w-4 text-muted-foreground/50" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, vendor, status, or score"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="rounded-full border border-white/10 bg-white/5 p-1.5 text-muted-foreground transition hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {searchQuery && (
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/60">
          Showing {filteredVehicles.length} of {vehicles.length} vehicles
        </div>
      )}

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredVehicles.map((vehicle, index) => {
          const healthStatus = getHealthStatus(vehicle.healthScore);

          return (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => {
                sessionStorage.setItem(LAST_VEHICLE_STORAGE_KEY, vehicle.id);
                navigate(paths.vehicle(vehicle.id));
              }}
              className="glass-card group cursor-pointer p-0 overflow-hidden hover:border-primary/40 transition-all active:scale-[0.995]"
            >
              <div className="flex items-stretch">
                {/* Status Sidebar Accent */}
                <div className={`w-1 ${vehicle.status === 'online' ? 'bg-emerald-500' : 'bg-muted opacity-20'}`} />

                <div className="flex-1 flex items-center justify-between p-6">
                  {/* Left: Identity */}
                  <div className="flex items-center gap-12 flex-1">
                    <div className="min-w-[140px]">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-40 text-[9px]">Node_ID</p>
                      <p className="text-xl font-black tracking-tighter uppercase text-precision group-hover:text-primary transition-colors">{vehicle.id}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-wider mt-1">{vehicle.vendor}</p>
                    </div>

                    {/* Stats Group */}
                    <div className="flex items-center gap-16">
                      {/* Battery */}
                      <div className="min-w-[120px]">
                        <div className="flex items-center gap-2 mb-2">
                           <Battery className="w-3.5 h-3.5 text-muted-foreground opacity-40" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Energy</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-lg font-bold text-precision">{vehicle.battery.toFixed(0)}<span className="text-[10px] text-muted-foreground ml-0.5">%</span></span>
                           <div className="flex-1 w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${vehicle.battery > 20 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                                style={{ width: `${vehicle.battery}%` }}
                              />
                           </div>
                        </div>
                      </div>

                      {/* Temperature */}
                      <div className="min-w-[100px]">
                        <div className="flex items-center gap-2 mb-2">
                           <Thermometer className="w-3.5 h-3.5 text-muted-foreground opacity-40" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Thermal</span>
                        </div>
                        <p className="text-lg font-bold text-precision">
                          {vehicle.temperature.toFixed(1)}<span className="text-[10px] text-muted-foreground ml-0.5">°C</span>
                        </p>
                      </div>

                      {/* Health */}
                      <div className="min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                           <TrendingUp className="w-3.5 h-3.5 text-muted-foreground opacity-40" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">System_Health</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${healthStatus.color} ${healthStatus.glow}`}>
                             {healthStatus.label}
                           </span>
                           <span className="text-lg font-bold text-precision">{vehicle.healthScore}</span>
                           {vehicle.degradationDrivers && (
                             <div className="flex gap-1">
                               {vehicle.degradationDrivers.slice(0, 1).map((driver, i) => (
                                 <span key={i} className="text-[9px] font-bold text-amber-500/60 uppercase tracking-tighter">
                                   [{driver.label}]
                                 </span>
                               ))}
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Meta & Action */}
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                       <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-1">Status</p>
                       <div className={`text-[10px] font-black uppercase tracking-widest ${vehicle.status === 'online' ? 'text-emerald-400' : 'text-muted-foreground opacity-50'}`}>
                          {vehicle.status === 'online' ? 'SYNC_ACTIVE' : 'SYNC_LOST'}
                       </div>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                       <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20">
                          <ExternalLink className="w-4 h-4" />
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredVehicles.length === 0 && (
          <div className="glass-card border-dashed border-white/10 p-10 text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-foreground">No vehicles found</p>
            <p className="mt-2 text-xs text-muted-foreground">Try a different vehicle ID, vendor, or status.</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-6 rounded-full bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary-foreground"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-8 border-t border-white/5 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-30">
          Showing {vehicles.length} Network Instances
        </p>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Operational</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#EF4444]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Critical_Fault</span>
           </div>
        </div>
      </div>
    </div>
  );
}