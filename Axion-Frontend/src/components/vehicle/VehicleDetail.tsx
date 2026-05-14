import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Battery, Thermometer, Gauge, Clock, Activity, WifiOff, Circle, Zap, Info, Shield, CheckCircle, Upload, Heart, BrainCircuit, AlertTriangle } from 'lucide-react';
import { AxionApi, VehicleDetail as ApiVehicleDetail } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { POLL_VEHICLE_DETAIL, TELEMETRY_HISTORY_WINDOW, DEFAULT_CAMPAIGN_ID, HEALTH } from '../../config';
import { useWebSocket } from '../../hooks/useWebSocket';
import { RcaTimeline } from './RcaTimeline';

interface VehicleDetailProps {
  vehicleId: string | null;
  onBack: () => void;
}

interface TelemetryEvent {
  timestamp: string;
  event: string;
  oldValue?: string;
  newValue: string;
  type: 'battery' | 'speed' | 'temperature' | 'location' | 'charge' | 'info';
}

export function VehicleDetail({ vehicleId, onBack }: VehicleDetailProps) {
  const [vehicle, setVehicle] = useState<ApiVehicleDetail | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'outdated'>('synced');
  const [activeTab, setActiveTab] = useState<'live' | 'timeline' | 'policies' | 'ota' | 'rca'>('live');

  const [telemetryHistory, setTelemetryHistory] = useState<any[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (activeTab === 'timeline' && vehicleId) {
      const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
          // Fetch last 24 hours of aggregates
          const data = await AxionApi.getHistoryAggregates(vehicleId, '1h');
          const formatted = data.map(d => ({
            time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            speed: d.speed || 0,
            battery: d.batterySoc || 0,
            temp: d.batteryTemp || 0,
          }));
          setHistoricalData(formatted);
        } catch (e) {
          console.error("Failed to fetch historical data", e);
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [activeTab, vehicleId]);

  const { subscribeToVehicle } = useWebSocket();

  useEffect(() => {
    if (!vehicleId) return;

    const fetchVehicle = async () => {
      try {
        setSyncStatus('syncing');
        const data = await AxionApi.getVehicle(vehicleId);
        setVehicle(data);
        setIsOnline(data.online);
        setSyncStatus('synced');

        if (data.telemetry) {
          setTelemetryHistory(prev => {
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            if (data.telemetry.speedKmph == null && data.telemetry.batterySocPct == null && data.telemetry.batteryTempC == null) {
              return prev;
            }

            const newPoint = {
              time: timeStr,
              speed: data.telemetry.speedKmph ?? prev[prev.length - 1]?.speed ?? 0,
              battery: data.telemetry.batterySocPct ?? prev[prev.length - 1]?.battery ?? 0,
              temp: data.telemetry.batteryTempC ?? prev[prev.length - 1]?.temp ?? 0,
            };
            return [...prev, newPoint].slice(-TELEMETRY_HISTORY_WINDOW);
          });
        }
      } catch (e) {
        console.error("Failed to fetch vehicle detail", e);
        setSyncStatus('outdated');
      }
    };

    fetchVehicle();

    // Subscribe to live WebSocket feed for this vehicle
    const unsubscribe = subscribeToVehicle(vehicleId, (msg) => {
      if (msg.type === 'TWIN_UPDATE' && msg.data) {
        const data = msg.data;
        setVehicle((prev) => prev ? { ...prev, ...data } : data);
        setIsOnline(data.online);
        setSyncStatus('synced');

        if (data.telemetry) {
          setTelemetryHistory(prev => {
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const newPoint = {
              time: timeStr,
              speed: data.telemetry.speedKmph ?? prev[prev.length - 1]?.speed ?? 0,
              battery: data.telemetry.batterySocPct ?? prev[prev.length - 1]?.battery ?? 0,
              temp: data.telemetry.batteryTempC ?? prev[prev.length - 1]?.temp ?? 0,
            };
            return [...prev, newPoint].slice(-TELEMETRY_HISTORY_WINDOW);
          });
        }
      } else if (msg.type === 'HEALTH_CHANGE') {
        toast.info(`Vehicle ${vehicleId} health changed to ${msg.to}`, {
          description: `Previous state was ${msg.from}`,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [vehicleId, subscribeToVehicle]);

  if (!vehicleId) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto">
        <div className="glass-card p-8">
          <div className="flex items-start gap-4 mb-8">
            <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight mb-2 uppercase">Digital Twin Engine</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl opacity-70">
                A high-fidelity virtual representation of vehicle telemetry, enabling real-time diagnostics, 
                predictive analytics, and remote orchestration via the Axion Fleet OS.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <Activity className="w-4 h-4" /> State Synchronization
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Battery Core', desc: 'Voltage, SOC, Thermal' },
                  { label: 'Thermal Loop', desc: 'Coolant, Inverter, Motor' },
                  { label: 'Kinematics', desc: 'Velocity, Vector, GPS' },
                  { label: 'Operations', desc: 'Odometer, Faults, OTA' },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-lg group hover:border-primary/30 transition-colors">
                    <p className="text-xs font-bold uppercase tracking-tight mb-1">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground opacity-60 font-mono">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Governance Layer
              </h3>
              <div className="space-y-3">
                {[
                  'OTA Eligibility Guardrails',
                  'Thermal Protection Protocols',
                  'Predictive Maintenance Scheduling'
                ].map((policy, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs font-bold text-muted-foreground group">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_#10B981]" />
                    <span className="group-hover:text-foreground transition-colors">{policy}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg border-dashed">
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  Select a vehicle instance from the fleet list to initialize a live synchronization session with its Digital Twin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'battery': return Battery;
      case 'speed': return Gauge;
      case 'temperature': return Thermometer;
      case 'charge': return Zap;
      default: return Circle;
    }
  };

  const snapshot = vehicle?.telemetry;
  const telemetryEvents: TelemetryEvent[] = snapshot ? [
    { timestamp: new Date().toISOString(), type: 'battery', event: 'TELEMETRY_SYNC', newValue: `${snapshot.batterySocPct?.toFixed(1)}%` },
    { timestamp: new Date().toISOString(), type: 'temperature', event: 'THERMAL_SYNC', newValue: `${snapshot.batteryTempC?.toFixed(1)}°C` }
  ] : [];

  const handleTriggerOta = async () => {
    try {
      if (vehicleId) {
        await AxionApi.triggerOTA(DEFAULT_CAMPAIGN_ID, vehicleId);
        toast.success('OTA INITIATED', {
          description: `Orchestration sequence triggered for ${vehicleId}`,
        });
      }
    } catch (e) {
      toast.error('OTA_TRIGGER_FAILED', {
        description: 'System could not reach target node.',
      });
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary mb-4 transition-colors group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            <span>Fleet / {vehicleId}</span>
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black tracking-tighter uppercase text-precision">{vehicleId}</h1>
            <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
               <span className="text-[10px] font-black uppercase tracking-widest text-primary">Instance Sync Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
            isOnline ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-gray-500/5 border-white/10 text-muted-foreground'
          }`}>
             <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
             <span className="text-[11px] font-black uppercase tracking-widest">{isOnline ? 'SYNC_LIVE' : 'SYNC_LOST'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT/CENTER: Visualization & Key Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 relative overflow-hidden min-h-[400px] flex flex-col justify-between">
             {/* Schematic Label */}
             <div className="absolute top-6 left-6 z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Schematic / v2.4</p>
                <p className="text-[9px] text-muted-foreground opacity-50 font-mono uppercase">Node Synchronization Active</p>
             </div>

             <div className="flex-1 flex items-center justify-center relative">
                {/* SVG Visual */}
                <motion.div
                  animate={{ opacity: isOnline ? 1 : 0.2, filter: isOnline ? 'none' : 'grayscale(100%) blur(2px)' }}
                  className="relative z-10 scale-125"
                >
                   <svg width="400" height="200" viewBox="0 0 300 180" fill="none">
                      <defs>
                        <linearGradient id="carBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                        </linearGradient>
                      </defs>
                      <path d="M 50 120 L 70 100 L 100 90 L 130 85 L 170 85 L 200 90 L 230 100 L 250 120 L 250 140 L 230 145 L 70 145 L 50 140 Z" fill="url(#carBodyGrad)" opacity="0.9" />
                      <path d="M 120 85 L 140 70 L 160 70 L 180 85 Z" fill="white" opacity="0.1" />
                      <circle cx="90" cy="145" r="18" fill="#080809" stroke="#10B981" strokeWidth="2" />
                      <circle cx="210" cy="145" r="18" fill="#080809" stroke="#3b82f6" strokeWidth="2" />
                   </svg>
                </motion.div>
                
                {/* Visual Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />
             </div>

             <div className="grid grid-cols-4 gap-4 mt-8">
                {[
                  { label: 'Speed', val: vehicle?.telemetry?.speedKmph?.toFixed(0) || 0, unit: 'km/h', icon: Gauge, color: 'text-primary' },
                  { label: 'Battery', val: vehicle?.battery?.toFixed(0) || 0, unit: '%', icon: Battery, color: (vehicle?.battery ?? 0) > 20 ? 'text-emerald-400' : 'text-red-400' },
                  { label: 'Thermal', val: vehicle?.temperature?.toFixed(1) || 0, unit: '°C', icon: Thermometer, color: (vehicle?.temperature ?? 0) < 45 ? 'text-amber-400' : 'text-red-400' },
                  { label: 'Health', val: vehicle?.healthScore || 0, unit: 'pts', icon: Heart, color: 'text-blue-400' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/5 rounded-lg p-3 group hover:border-primary/20 transition-all">
                     <div className="flex items-center gap-2 mb-2">
                        <stat.icon className={`w-3 h-3 ${stat.color}`} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                     </div>
                     <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-precision">{stat.val}</span>
                        <span className="text-[9px] text-muted-foreground font-mono">{stat.unit}</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-white/10 mb-4 flex-wrap gap-2">
            <button 
              onClick={() => setActiveTab('live')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'live' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Live Telemetry
            </button>
            <button 
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'timeline' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              24h History (TimescaleDB)
            </button>
            <button 
              onClick={() => setActiveTab('rca')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'rca' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-muted-foreground hover:text-foreground'}`}
            >
              RCA Timeline Engine
            </button>
          </div>

          {/* Tab Content Panels */}
          {activeTab === 'rca' ? (
            <div className="glass-card p-6">
               <div className="mb-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-400">
                    Root Cause Event Correlation
                  </h3>
                  <p className="text-[10px] text-muted-foreground opacity-60 mt-1">
                    Multi-storage chronological event integration tracing firmware updates & sensory delta breaches.
                  </p>
               </div>
               <RcaTimeline vehicleId={vehicleId} />
            </div>
          ) : (
            <div className="glass-card p-6">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                    {activeTab === 'live' ? 'Telemetry Timeline' : 'Historical Aggregates'}
                  </h3>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary">
                        <div className={`w-1 h-1 rounded-full bg-primary ${activeTab === 'live' ? 'animate-pulse' : ''}`} /> 
                        {activeTab === 'live' ? 'REALTIME' : 'ARCHIVED'}
                     </div>
                  </div>
               </div>
               
               <div className="h-64 w-full">
                  {activeTab === 'timeline' && loadingHistory ? (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground font-mono">LOADING HISTORY...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={activeTab === 'live' ? telemetryHistory : historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={9} tickMargin={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} width={25} axisLine={false} tickLine={false} />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: 'rgba(13, 15, 20, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '10px' }}
                        />
                        <Line type="monotone" dataKey="speed" stroke="#10B981" strokeWidth={2} dot={activeTab === 'timeline'} isAnimationActive={false} />
                        <Line type="monotone" dataKey="battery" stroke="#3b82f6" strokeWidth={2} dot={activeTab === 'timeline'} isAnimationActive={false} />
                        <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} dot={activeTab === 'timeline'} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
               </div>
               <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2 text-[9px] font-bold text-primary opacity-60"><div className="w-2 h-0.5 bg-primary" /> SPEED</div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-blue-400 opacity-60"><div className="w-2 h-0.5 bg-blue-400" /> BATTERY</div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-amber-400 opacity-60"><div className="w-2 h-0.5 bg-amber-400" /> TEMP</div>
               </div>
            </div>
          )}

        </div>

        {/* RIGHT: Status & Controls */}
        <div className="space-y-6">
          <div className="glass-card p-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Synchronization State</h3>
             
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                   <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Health State</p>
                      <p className={`text-sm font-bold uppercase ${vehicle?.healthState === 'CRITICAL' ? 'text-red-400' : 'text-primary'}`}>
                        {vehicle?.healthState || 'OFFLINE'}
                      </p>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Sync Index</p>
                      <p className="text-sm font-bold text-precision">{syncStatus === 'synced' ? 'STABLE' : 'PENDING'}</p>
                   </div>
                </div>

                <div className="space-y-2">
                   {[
                     { label: 'V-ID', val: vehicleId },
                     { label: 'PROFILE', val: 'AXION-EV-PLATFORM' },
                     { label: 'SCORE', val: `${vehicle?.healthScore || 0}/100`, color: 'text-primary' }
                   ].map((row, i) => (
                     <div key={i} className="flex justify-between items-center px-2 py-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{row.label}</span>
                        <span className={`text-[10px] font-black uppercase ${row.color || 'text-foreground'}`}>{row.val}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="glass-card p-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Orchestration</h3>
             <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={handleTriggerOta}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary text-primary-foreground rounded-lg text-[11px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                >
                  <Upload className="w-4 h-4" /> Initialize OTA Sync
                </button>
                <button className="w-full px-4 py-3 bg-white/5 border border-white/10 text-foreground rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                  Request Diagnostics
                </button>
             </div>
          </div>

          {/* ML Predictive Analytics */}
          <div className="glass-card p-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
               <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
               Predictive Intelligence
             </h3>
             <div className="space-y-4">
               {/* Battery Depletion Prediction */}
               <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                 <div className="flex items-center gap-2 mb-3">
                   <Battery className="w-3.5 h-3.5 text-blue-400" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Battery Depletion Forecast</span>
                 </div>
                 {(vehicle as any)?.predictions?.batteryDepletion ? (
                   <>
                     <div className="flex items-baseline gap-2">
                       <span className={`text-2xl font-black tracking-tight ${
                         (vehicle as any).predictions.batteryDepletion.hours < 2 ? 'text-red-400' : 
                         (vehicle as any).predictions.batteryDepletion.hours < 5 ? 'text-amber-400' : 'text-emerald-400'
                       }`}>
                         {(vehicle as any).predictions.batteryDepletion.hours}
                       </span>
                       <span className="text-[9px] text-muted-foreground font-mono">hours remaining</span>
                     </div>
                     <div className="mt-2 flex items-center gap-2">
                       <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                           style={{ width: `${Math.min(100, (vehicle as any).predictions.batteryDepletion.confidence * 100)}%` }}
                         />
                       </div>
                       <span className="text-[9px] font-black text-muted-foreground">
                         {((vehicle as any).predictions.batteryDepletion.confidence * 100).toFixed(0)}% conf
                       </span>
                     </div>
                   </>
                 ) : (
                   <span className="text-[10px] text-muted-foreground opacity-40 italic">Awaiting prediction data...</span>
                 )}
               </div>

               {/* Temperature Anomaly Detection */}
               <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                 <div className="flex items-center gap-2 mb-3">
                   <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Thermal Anomaly Risk</span>
                 </div>
                 {(vehicle as any)?.predictions?.tempAnomaly ? (
                   <>
                     <div className="flex items-center justify-between">
                       <div className={`px-3 py-1.5 rounded border text-[10px] font-black uppercase tracking-widest ${
                         (vehicle as any).predictions.tempAnomaly.risk === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                         (vehicle as any).predictions.tempAnomaly.risk === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                         'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                       }`}>
                         {(vehicle as any).predictions.tempAnomaly.risk === 'HIGH' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                         {(vehicle as any).predictions.tempAnomaly.risk}
                       </div>
                       <div className="text-right">
                         <div className="text-lg font-black text-precision">
                           {(vehicle as any).predictions.tempAnomaly.predictedPeakC}°C
                         </div>
                         <div className="text-[8px] text-muted-foreground font-mono uppercase">Predicted Peak</div>
                       </div>
                     </div>
                   </>
                 ) : (
                   <span className="text-[10px] text-muted-foreground opacity-40 italic">Awaiting prediction data...</span>
                 )}
               </div>

               <div className="p-2 bg-purple-500/5 border border-purple-500/10 rounded text-center">
                 <span className="text-[8px] font-bold text-purple-400/60 uppercase tracking-widest">XGBoost + Isolation Forest • Redis Cached 60s</span>
               </div>
             </div>
          </div>

          {/* Policy Guardrails */}
          <div className="glass-card p-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Policy Guardrails</h3>
             <div className="space-y-3">
                {[
                  { rule: 'Voltage Critical', pass: (vehicle?.battery ?? 100) > 10 },
                  { label: 'Thermal Safety', pass: (vehicle?.temperature ?? 0) < 55 },
                  { label: 'Sync Integrity', pass: isOnline }
                ].map((rule, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                    <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">{rule.rule || rule.label}</span>
                    <div className={`text-[9px] font-black uppercase ${rule.pass ? 'text-emerald-400' : 'text-red-400'}`}>
                       {rule.pass ? 'SECURE' : 'BREACH'}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}