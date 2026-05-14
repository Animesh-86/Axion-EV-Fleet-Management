import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Car, Wifi, WifiOff, Heart, TrendingUp, AlertTriangle, Battery, Thermometer, Activity, Circle } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { AxionApi, FleetSummary, FleetVehicle } from '../../services/api';
import { POLL_DASHBOARD, COUNTER_ANIMATION_DURATION } from '../../config';
import { useWebSocket } from '../../hooks/useWebSocket';
import { FleetAssistantPanel } from './FleetAssistantPanel';

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
  const { status, subscribeToFleet } = useWebSocket();

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

    fetchData();

    const unsubscribe = subscribeToFleet((msg) => {
      if (msg.type === 'TWIN_UPDATE' && msg.data) {
        const twin = msg.data;
        setVehicles((prev) => {
          const idx = prev.findIndex(v => v.vehicleId === twin.vehicleId);
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

          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updatedVehicle;
            return next;
          } else {
            return [...prev, updatedVehicle];
          }
        });

        setSummary((prevSum) => {
          if (!prevSum) return prevSum;
          return {
            ...prevSum,
            totalEventsProcessed: prevSum.totalEventsProcessed + 1,
          };
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToFleet]);

  const avgHealth = vehicles.length > 0
    ? Math.round(vehicles.reduce((acc, v) => acc + v.healthScore, 0) / vehicles.length)
    : 0;

  const kpiCards = [
    {
      title: 'Total Vehicles',
      value: summary?.totalVehicles || 0,
      icon: Car,
      trend: 'Fleet Size',
      iconColor: 'text-primary',
      glowColor: 'rgba(16, 185, 129, 0.2)',
    },
    {
      title: 'Online',
      value: summary?.onlineVehicles || 0,
      suffix: `/${summary?.totalVehicles || 0}`,
      icon: Wifi,
      trend: 'Active',
      iconColor: 'text-emerald-400',
      glowColor: 'rgba(16, 185, 129, 0.2)',
    },
    {
      title: 'Offline',
      value: (summary?.totalVehicles || 0) - (summary?.onlineVehicles || 0),
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
              </div>

              <div 
                className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: card.glowColor }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* MAIN CONTENT GRID */}
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

        {/* RIGHT: Active Fleet Roster */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass-card p-6 lg:col-span-2 flex flex-col h-[450px]"
        >
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
              Real-Time Asset Roster ({vehicles.length})
            </h3>
            <span className="text-[10px] font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              SYNCHRONIZED
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-2">
              {vehicles.map((vehicle) => {
                const isCritical = vehicle.healthState === 'CRITICAL';
                const isDegraded = vehicle.healthState === 'DEGRADED';
                const statusColor = isCritical ? 'text-red-400' : isDegraded ? 'text-amber-400' : 'text-emerald-400';

                return (
                  <motion.div
                    key={vehicle.vehicleId}
                    layout
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

      {/* Floating GenAI Assistant Panel */}
      <FleetAssistantPanel />
    </div>
  );
}