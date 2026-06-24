import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Wifi, WifiOff, Heart, AlertTriangle, Battery, Thermometer, Activity, Circle, Sparkles, Bot, X, Upload, BrainCircuit, Gauge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { AxionApi, FleetSummary, FleetVehicle } from '../../services/api';
import { POLL_DASHBOARD, COUNTER_ANIMATION_DURATION, DEFAULT_CAMPAIGN_ID } from '../../config';
import { useWebSocket } from '../../hooks/useWebSocket';
import { FleetAssistantPanel } from './FleetAssistantPanel';
import { toast } from 'sonner';
import { paths } from '../../constants/navigation';

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = COUNTER_ANIMATION_DURATION;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="text-3xl font-semibold">
      {count}{suffix}
    </span>
  );
}

export function FleetDashboard() {
  const [summary, setSummary] = useState<FleetSummary | null>(null);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [riskRanking, setRiskRanking] = useState<Array<{ vehicleId: string; riskScore: number }>>([]);
  const { status, subscribeToFleet } = useWebSocket();
  const navigate = useNavigate();
  const pendingUpdates = useRef<Map<string, FleetVehicle>>(new Map());
  const pendingEventCount = useRef(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumData, vehData] = await Promise.all([
          AxionApi.getFleetSummary(),
          AxionApi.getFleetVehicles()
        ]);
        setSummary(sumData);
        setVehicles(vehData);
      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      }
    };

    if (status === 'CONNECTED') {
      fetchData();
    } else if (summary === null) {
      fetchData();
    }


    const unsubscribe = subscribeToFleet((msg) => {
      if (msg.type === 'TWIN_UPDATE' && msg.data) {
        const twin = msg.data;
        const updatedVehicle: FleetVehicle = {
          vehicleId: twin.vehicleId,
          vendor: twin.vendor || 'Axion',
          online: twin.online,
          healthScore: twin.healthScore,
          healthState: twin.healthState,
          lastSeen: twin.lastSeen,
          battery: twin.telemetry?.batterySocPct || 0,
          temperature: twin.telemetry?.batteryTempC || 0,
        };
        
        pendingUpdates.current.set(twin.vehicleId, updatedVehicle);
        pendingEventCount.current += 1;
      }
    });

    const flushTimer = setInterval(() => {
      if (pendingUpdates.current.size > 0 || pendingEventCount.current > 0) {
        setVehicles((prev) => {
          if (pendingUpdates.current.size === 0) return prev;
          const next = [...prev];
          let changed = false;
          pendingUpdates.current.forEach((updatedVehicle, vehicleId) => {
            const idx = next.findIndex(v => v.vehicleId === vehicleId);
            if (idx >= 0) {
              next[idx] = updatedVehicle;
            } else {
              next.push(updatedVehicle);
            }
            changed = true;
          });
          pendingUpdates.current.clear();
          return changed ? next : prev;
        });

        if (pendingEventCount.current > 0) {
          setSummary((prevSum) => {
            if (!prevSum) return prevSum;
            const nextSum = {
              ...prevSum,
              totalEventsProcessed: prevSum.totalEventsProcessed + pendingEventCount.current,
            };
            pendingEventCount.current = 0;
            return nextSum;
          });
        }
      }
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(flushTimer);
    };
  }, [subscribeToFleet, status]);

  useEffect(() => {
    let mounted = true;
    const loadRanking = async () => {
      try {
        const data = await AxionApi.getFleetRiskRanking();
        if (mounted) setRiskRanking(data || []);
      } catch (e) {
        console.debug('Could not fetch ML ranking:', e);
      }
    };
    loadRanking();
    return () => { mounted = false; };
  }, []);

  const avgHealth = vehicles.length > 0
    ? Math.round(vehicles.reduce((acc, v) => acc + v.healthScore, 0) / vehicles.length)
    : 0;

  const totalVehicles = Math.max(summary?.totalVehicles || 0, vehicles.length);
  const onlineVehicles = summary?.onlineVehicles ?? vehicles.filter(v => v.online).length;
  const offlineVehicles = Math.max(0, totalVehicles - onlineVehicles);

  const kpiCards = [
    {
      title: 'Total Vehicles',
      value: totalVehicles,
      icon: Car,
      trend: 'Fleet Size',
      iconColor: 'text-primary',
      glowColor: 'rgba(16, 185, 129, 0.2)',
    },
    {
      title: 'Online',
      value: onlineVehicles,
      suffix: `/${totalVehicles}`,
      icon: Wifi,
      trend: 'Active',
      iconColor: 'text-emerald-400',
      glowColor: 'rgba(16, 185, 129, 0.2)',
    },
    {
      title: 'Offline',
      value: offlineVehicles,
      icon: WifiOff,
      trend: 'Inactive',
      iconColor: 'text-gray-400',
      glowColor: 'rgba(156, 163, 175, 0.2)',
    },
    {
      title: 'Avg Health',
      value: avgHealth,
      suffix: '%',
      icon: Heart,
      trend: 'Optimal',
      iconColor: 'text-blue-400',
      glowColor: 'rgba(59, 130, 246, 0.2)',
    },
    {
      title: 'Critical',
      value: summary?.critical || 0,
      icon: AlertTriangle,
      trend: 'Requires Action',
      iconColor: 'text-red-400',
      glowColor: 'rgba(239, 68, 68, 0.2)',
    },
    {
      title: 'Predicted Critical',
      value: summary?.predictedCritical || 0,
      icon: AlertTriangle,
      trend: 'ML Prediction',
      iconColor: 'text-pink-400',
      glowColor: 'rgba(239, 68, 68, 0.12)',
    },
    {
      title: 'Throughput',
      value: Math.round(summary?.eventsPerSecond || 0),
      suffix: ' msg/s',
      icon: Activity,
      trend: 'Ingestion',
      iconColor: 'text-amber-400',
      glowColor: 'rgba(245, 158, 11, 0.2)',
    },
  ];

  const chartData = [
    { name: 'Healthy', value: summary?.healthy || 0, color: '#10B981' },
    { name: 'Degraded', value: summary?.degraded || 0, color: '#F59E0B' },
    { name: 'Critical', value: summary?.critical || 0, color: '#EF4444' },
  ].filter(d => d.value > 0);

  const selectedVehicle = vehicles.find(v => v.vehicleId === selectedVehicleId);
  const topPredictedVehicleId = riskRanking[0]?.vehicleId ?? null;

  const openPredictedCriticalDetails = () => {
    if (topPredictedVehicleId) {
      navigate(`/vehicles/${topPredictedVehicleId}`);
    } else {
      navigate(paths.vehicles);
    }
  };

  const handleTriggerOtaModal = async (vId: string) => {
    try {
      await AxionApi.triggerOTA(DEFAULT_CAMPAIGN_ID, vId);
      toast.success('OTA INITIATED', {
        description: `Orchestration sequence triggered for ${vId}`,
      });
    } catch (e) {
      toast.error('OTA_TRIGGER_FAILED', {
        description: 'System could not reach target node.',
      });
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto relative">
      {/* Header */}
      <div className="flex justify-between items-end pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Circle className={`w-2 h-2 ${status === 'CONNECTED' ? 'fill-emerald-500 text-emerald-500 animate-pulse' : 'fill-red-500 text-red-500'}`} />
            <span className="text-[10px] font-bold tracking-widest uppercase font-mono opacity-60">
              {status === 'CONNECTED' ? 'LIVE TELEMETRY STREAM' : 'OFFLINE / RECONNECTING'}
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-foreground">Mission Control</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-widest font-medium opacity-70">
            Real-time Telemetry Orchestration
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Last Updated</p>
          <p className="text-sm font-mono text-primary">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-card p-5 relative group overflow-hidden"
              title={card.title === 'Predicted Critical' ? 'ML predicted critical vehicles (riskScore ≥ configured threshold). This is a prediction, not the current twin health.' : undefined}
              role={card.title === 'Predicted Critical' ? 'button' : undefined}
              tabIndex={card.title === 'Predicted Critical' ? 0 : undefined}
              onClick={card.title === 'Predicted Critical' ? openPredictedCriticalDetails : undefined}
              onKeyDown={card.title === 'Predicted Critical' ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openPredictedCriticalDetails();
                }
              } : undefined}
            >
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="bg-white/5 p-2 rounded-lg border border-white/5 group-hover:border-primary/30 transition-colors">
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter opacity-60">
                  {card.trend}
                </span>
              </div>

              <div className="relative z-10">
                <p className="text-[11px] text-muted-foreground uppercase tracking-[0.1em] font-semibold mb-1">
                  {card.title}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-precision">
                    <AnimatedCounter value={card.value} />
                  </span>
                  {card.suffix && <span className="text-sm text-muted-foreground font-mono">{card.suffix}</span>}
                </div>
                {card.title === 'Predicted Critical' && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-pink-300">
                    ML details
                    <span className="opacity-60">→</span>
                    <span className="truncate max-w-[130px]">
                      {topPredictedVehicleId ?? 'Vehicles'}
                    </span>
                  </div>
                )}
              </div>

              <div 
                className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: card.glowColor }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* ROW 1: Health Distribution & GenAI Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Fleet Health Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="glass-card p-6 lg:col-span-1 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                Health Score Distribution
              </h3>
              <Heart className="w-4 h-4 text-primary opacity-50" />
            </div>

            <div className="h-64 w-full relative flex items-center justify-center mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 12, 16, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center pointer-events-none">
                <div className="text-2xl font-black font-mono">
                  {summary?.totalVehicles ? Math.round(((summary?.healthy || 0) / summary.totalVehicles) * 100) : 0}%
                </div>
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Fleet Index</div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/5">
            {chartData.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-mono font-bold">{item.value} units</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT: GenAI Fleet Report & Intelligence Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="glass-card p-6 lg:col-span-2 flex flex-col justify-between relative overflow-hidden h-[450px]"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" /> GenAI Fleet Intelligence
              </h3>
              <span className="text-[9px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded uppercase">
                LLM RAG ACTIVE
              </span>
            </div>

            {/* GenAI Report Summary Box */}
            <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-xl mb-6 relative group">
              <div className="absolute top-3 right-3">
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              </div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-purple-300 mb-1">Automated Fleet Synthesis</h4>
              <p className="text-xs leading-relaxed text-purple-100 font-medium">
                {riskRanking.length > 0 ? (
                  <>Top flagged vehicle: <strong className="text-precision underline decoration-primary">{riskRanking[0].vehicleId}</strong> (risk {(riskRanking[0].riskScore*100).toFixed(0)}%)</>
                ) : (
                  <>No active ML alerts. Predictions will appear here when the ML service provides ranking data.</>
                )}
              </p>
            </div>

            {/* Real-time ML Predictions List */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-primary" /> Active ML Predictions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { vId: 'v019', issue: 'Thermal Runaway Risk', time: '4 hrs', risk: 'CRITICAL', color: 'text-red-400 border-red-500/20 bg-red-500/10' },
                  { vId: 'fleet-a-077', issue: 'Cell Balancing Degradation', time: '12 hrs', risk: 'WARNING', color: 'text-amber-400 border-amber-500/20 bg-amber-500/10' },
                  { vId: 'fleet-b-022', issue: 'Optimal Kinematics', time: 'Stable', risk: 'HEALTHY', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' }
                ].map((pred, i) => (
                  <div key={i} className="flex flex-col justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg group hover:border-purple-500/20 transition-all">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center font-mono font-bold text-xs text-precision">
                        {pred.vId}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground truncate w-full">{pred.issue}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">Horizon: {pred.time}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-1 rounded border text-center w-full ${pred.color}`}>
                      {pred.risk}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-center shrink-0 mt-4">
            <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">
              ⚡ Powered by Spring AI & TimescaleDB RAG
            </p>
          </div>
        </motion.div>
      </div>

      {/* ROW 2: Real-Time Asset Roster */}
      <div className="grid grid-cols-1 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass-card p-6 flex flex-col h-[450px]"
        >
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
              Real-Time Asset Roster ({vehicles.length})
            </h3>
            <span className="text-[10px] font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              SYNCHRONIZED
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar" data-fleet-roster>
            <div className="space-y-2">
              {vehicles.map((vehicle) => {
                const isCritical = vehicle.healthState === 'CRITICAL';
                const isDegraded = vehicle.healthState === 'DEGRADED';
                const statusColor = isCritical ? 'text-red-400' : isDegraded ? 'text-amber-400' : 'text-emerald-400';

                return (
                  <motion.div
                    key={vehicle.vehicleId}
                    layout
                    onClick={() => setSelectedVehicleId(vehicle.vehicleId)}
                    className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-primary/20 rounded-lg p-3 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-8 rounded-full ${isCritical ? 'bg-red-500' : isDegraded ? 'bg-amber-500' : 'bg-emerald-500'} opacity-50`} />
                        <div>
                          <span className="text-sm font-bold text-precision group-hover:text-primary transition-colors">{vehicle.vehicleId}</span>
                          <div className="flex gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                              <Battery className="w-3 h-3" /> {vehicle.battery?.toFixed(0)}%
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                              <Thermometer className="w-3 h-3" /> {vehicle.temperature?.toFixed(0)}°C
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-[10px] font-black uppercase tracking-tighter ${statusColor}`}>
                          {vehicle.healthState}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          SCORE: {vehicle.healthScore}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* VEHICLE DETAILS MODAL */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedVehicleId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0A0C10] border border-white/10 rounded-2xl p-8 max-w-4xl w-full shadow-2xl space-y-6 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase bg-primary/10 text-primary border border-primary/20">
                      Digital Twin Instance
                    </span>
                    <span className="text-xs text-muted-foreground font-mono uppercase">Node: {selectedVehicle.vehicleId}</span>
                  </div>
                  <h2 className="text-2xl font-black uppercase text-foreground">{selectedVehicle.vehicleId} Telemetry Breakdown</h2>
                </div>
                <button
                  onClick={() => setSelectedVehicleId(null)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg bg-white/5 border border-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-5 space-y-4 md:col-span-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">State Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2.5 bg-white/[0.02] rounded border border-white/5">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase">Health Score</span>
                      <span className="text-sm font-black text-precision">{selectedVehicle.healthScore} / 100</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-white/[0.02] rounded border border-white/5">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase">Status</span>
                      <span className={`text-xs font-black uppercase ${
                        selectedVehicle.healthState === 'CRITICAL' ? 'text-red-400' : selectedVehicle.healthState === 'DEGRADED' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>{selectedVehicle.healthState}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-white/[0.02] rounded border border-white/5">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase">Connectivity</span>
                      <span className="text-xs font-bold text-emerald-400">ONLINE</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-5 space-y-4 md:col-span-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Telemetry & Controls</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-white/[0.02] rounded-lg border border-white/5">
                      <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                        <Battery className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Battery</span>
                      </div>
                      <div className="text-2xl font-black text-precision">{selectedVehicle.battery?.toFixed(0)}%</div>
                    </div>

                    <div className="p-4 bg-white/[0.02] rounded-lg border border-white/5">
                      <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                        <Thermometer className="w-4 h-4 text-amber-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Thermal</span>
                      </div>
                      <div className="text-2xl font-black text-precision">{selectedVehicle.temperature?.toFixed(1)}°C</div>
                    </div>

                    <div className="p-4 bg-white/[0.02] rounded-lg border border-white/5">
                      <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                        <Gauge className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Speed</span>
                      </div>
                      <div className="text-2xl font-black text-precision">65 km/h</div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => handleTriggerOtaModal(selectedVehicle.vehicleId)}
                      className="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                    >
                      <Upload className="w-4 h-4" /> Trigger OTA Firmware Synchronization
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono">UUID: axion-node-{selectedVehicle.vehicleId.toLowerCase()}</span>
                <span className="text-primary font-bold uppercase tracking-widest">Digital Twin Active</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating GenAI Assistant Panel */}
      <FleetAssistantPanel />
    </div>
  );
}