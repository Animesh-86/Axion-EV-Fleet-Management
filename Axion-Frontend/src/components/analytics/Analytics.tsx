import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Battery, Thermometer, Heart, Wifi, WifiOff, TrendingUp, Activity } from 'lucide-react';
import { POLL_ANALYTICS, TELEMETRY_HISTORY_WINDOW, HEALTH } from '../../config';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, LineChart, Line, AreaChart, Area,
} from 'recharts';
import { AxionApi, FleetSummary, FleetVehicle } from '../../services/api';

const HEALTH_COLORS = { HEALTHY: '#10b981', DEGRADED: '#f59e0b', CRITICAL: '#ef4444' };

export function Analytics() {
  const [summary, setSummary] = useState<FleetSummary | null>(null);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [healthHistory, setHealthHistory] = useState<{ time: string; healthy: number; degraded: number; critical: number }[]>([]);
  const [batteryHistory, setBatteryHistory] = useState<{ time: string; avg: number; min: number; max: number }[]>([]);
  const historyRef = useRef({ health: [] as typeof healthHistory, battery: [] as typeof batteryHistory });

  useEffect(() => {
    const fetch = async () => {
      try {
        const [s, v] = await Promise.all([AxionApi.getFleetSummary(), AxionApi.getFleetVehicles()]);
        setSummary(s);
        setVehicles(v);

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const hEntry = { time: now, healthy: s.healthy, degraded: s.degraded, critical: s.critical };
        const prevH = historyRef.current.health;
        const newH = [...prevH, hEntry].slice(-TELEMETRY_HISTORY_WINDOW);
        historyRef.current.health = newH;
        setHealthHistory(newH);

        if (v.length > 0) {
          const batteries = v.map(x => x.battery).filter(b => b != null);
          const avg = batteries.reduce((a, b) => a + b, 0) / batteries.length;
          const bEntry = { time: now, avg: +avg.toFixed(1), min: Math.min(...batteries), max: Math.max(...batteries) };
          const prevB = historyRef.current.battery;
          const newB = [...prevB, bEntry].slice(-TELEMETRY_HISTORY_WINDOW);
          historyRef.current.battery = newB;
          setBatteryHistory(newB);
        }
      } catch { /* offline */ }
    };
    fetch();
    const id = setInterval(fetch, POLL_ANALYTICS);
    return () => clearInterval(id);
  }, []);

  const healthDist = summary ? [
    { name: 'Healthy', value: summary.healthy, color: HEALTH_COLORS.HEALTHY },
    { name: 'Degraded', value: summary.degraded, color: HEALTH_COLORS.DEGRADED },
    { name: 'Critical', value: summary.critical, color: HEALTH_COLORS.CRITICAL },
  ].filter(d => d.value > 0) : [];

  const batteryBuckets = () => {
    const buckets = [
      { range: '0-20%', count: 0, color: '#ef4444' },
      { range: '21-40%', count: 0, color: '#f97316' },
      { range: '41-60%', count: 0, color: '#eab308' },
      { range: '61-80%', count: 0, color: '#22c55e' },
      { range: '81-100%', count: 0, color: '#10b981' },
    ];
    vehicles.forEach(v => {
      const b = v.battery;
      if (b == null) return;
      if (b <= 20) buckets[0].count++;
      else if (b <= 40) buckets[1].count++;
      else if (b <= 60) buckets[2].count++;
      else if (b <= 80) buckets[3].count++;
      else buckets[4].count++;
    });
    return buckets;
  };

  const tempBuckets = () => {
    const buckets = [
      { range: '<25°C', count: 0, color: '#3b82f6' },
      { range: '25-35°C', count: 0, color: '#10b981' },
      { range: `35-${HEALTH.TEMP_WARNING_C}°C`, count: 0, color: '#f59e0b' },
      { range: `${HEALTH.TEMP_WARNING_C}-${HEALTH.TEMP_CRITICAL_C}°C`, count: 0, color: '#f97316' },
      { range: `>${HEALTH.TEMP_CRITICAL_C}°C`, count: 0, color: '#ef4444' },
    ];
    vehicles.forEach(v => {
      const t = v.temperature;
      if (t == null) return;
      if (t < 25) buckets[0].count++;
      else if (t < 35) buckets[1].count++;
      else if (t < HEALTH.TEMP_WARNING_C) buckets[2].count++;
      else if (t < HEALTH.TEMP_CRITICAL_C) buckets[3].count++;
      else buckets[4].count++;
    });
    return buckets;
  };

  const onlinePercent = summary && summary.totalVehicles > 0
    ? ((summary.onlineVehicles / summary.totalVehicles) * 100).toFixed(0) : '0';
  const avgBattery = vehicles.length > 0
    ? (vehicles.reduce((a, v) => a + (v.battery ?? 0), 0) / vehicles.length).toFixed(1) : '0';
  const avgTemp = vehicles.length > 0
    ? (vehicles.reduce((a, v) => a + (v.temperature ?? 0), 0) / vehicles.length).toFixed(1) : '0';
  const avgHealth = vehicles.length > 0
    ? (vehicles.reduce((a, v) => a + v.healthScore, 0) / vehicles.length).toFixed(0) : '0';

  const kpis = [
    { label: 'Fleet Uptime', value: `${onlinePercent}%`, icon: Wifi, gradient: 'from-emerald-500/10 to-emerald-600/5', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    { label: 'Avg Battery', value: `${avgBattery}%`, icon: Battery, gradient: 'from-cyan-500/10 to-cyan-600/5', border: 'border-cyan-500/20', text: 'text-cyan-400' },
    { label: 'Avg Temp', value: `${avgTemp}°C`, icon: Thermometer, gradient: 'from-amber-500/10 to-amber-600/5', border: 'border-amber-500/20', text: 'text-amber-400' },
    { label: 'Avg Health', value: avgHealth, icon: Heart, gradient: 'from-purple-500/10 to-purple-600/5', border: 'border-purple-500/20', text: 'text-purple-400' },
  ];

  const tooltipStyle = {
    contentStyle: { backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', color: '#e5e7eb' },
    wrapperStyle: { outline: 'none' },
    itemStyle: { color: '#e5e7eb' },
  };
  const pieTooltipStyle = { ...tooltipStyle, cursor: false as const };

  return (
    <div className="p-8 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" /> Fleet Analytics
        </h1>
        <p className="text-muted-foreground">Real-time fleet performance monitoring and distribution analysis</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`rounded-xl bg-gradient-to-br ${kpi.gradient} p-5 border ${kpi.border}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{kpi.label}</span>
                <Icon className={`w-4 h-4 ${kpi.text}`} />
              </div>
              <div className={`text-3xl font-semibold ${kpi.text}`}>{kpi.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Row 1: Health Distribution + Battery Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6"
        >
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-400" /> Health Distribution
          </h2>
          {healthDist.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={healthDist} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                    {healthDist.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip {...pieTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {healthDist.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-sm text-muted-foreground">{d.name}</span>
                    <span className="text-sm font-semibold">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No fleet data available</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6"
        >
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Battery className="w-5 h-5 text-cyan-400" /> Battery SOC Distribution
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={batteryBuckets()}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="range" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px' }} />
              <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px' }} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {batteryBuckets().map((b, i) => <Cell key={i} fill={b.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Row 2: Temperature Distribution + Online/Offline Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6"
        >
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-amber-400" /> Temperature Distribution
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tempBuckets()}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="range" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px' }} />
              <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px' }} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {tempBuckets().map((b, i) => <Cell key={i} fill={b.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6"
        >
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" /> Connectivity Status
          </h2>
          {summary && summary.totalVehicles > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={[
                    { name: 'Online', value: summary.onlineVehicles, color: '#10b981' },
                    { name: 'Offline', value: summary.totalVehicles - summary.onlineVehicles, color: '#6b7280' },
                  ]} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                    <Cell fill="#10b981" />
                    <Cell fill="#6b7280" />
                  </Pie>
                  <Tooltip {...pieTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-2xl font-semibold text-emerald-400">{summary.onlineVehicles}</div>
                    <div className="text-xs text-muted-foreground">Online</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <WifiOff className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-2xl font-semibold text-gray-400">{summary.totalVehicles - summary.onlineVehicles}</div>
                    <div className="text-xs text-muted-foreground">Offline</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No fleet data available</div>
          )}
        </motion.div>
      </div>

      {/* Row 3: Health Trend + Battery Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6"
        >
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" /> Health State Trend
          </h2>
          {healthHistory.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={healthHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '10px' }} />
                <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px' }} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="healthy" stackId="1" stroke="#10b981" fill="#10b98133" />
                <Area type="monotone" dataKey="degraded" stackId="1" stroke="#f59e0b" fill="#f59e0b33" />
                <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef444433" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Collecting trend data...</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6"
        >
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Battery className="w-5 h-5 text-cyan-400" /> Battery SOC Trend
          </h2>
          {batteryHistory.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={batteryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '10px' }} />
                <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px' }} domain={[0, 100]} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="avg" stroke="#00e5ff" strokeWidth={2} dot={false} name="Average" />
                <Line type="monotone" dataKey="min" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Min" />
                <Line type="monotone" dataKey="max" stroke="#10b981" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Max" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Collecting trend data...</div>
          )}
        </motion.div>
      </div>

      {/* Vehicle Performance Table */}
      {vehicles.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="mt-6 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-medium">Vehicle Performance Ranking</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground">
                  <th className="text-left p-4">Vehicle</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Health</th>
                  <th className="text-left p-4">Battery</th>
                  <th className="text-left p-4">Temperature</th>
                  <th className="text-left p-4">Score</th>
                </tr>
              </thead>
              <tbody>
                {[...vehicles].sort((a, b) => a.healthScore - b.healthScore).map(v => (
                  <tr key={v.vehicleId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-xs">{v.vehicleId}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${v.online ? 'text-emerald-400' : 'text-gray-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${v.online ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                        {v.online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        v.healthState === 'HEALTHY' ? 'bg-emerald-500/10 text-emerald-400' :
                        v.healthState === 'DEGRADED' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>{v.healthState}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${v.battery > HEALTH.SOC_WARNING_PCT ? 'bg-emerald-400' : v.battery > HEALTH.SOC_CRITICAL_PCT ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${v.battery}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{v.battery?.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs ${v.temperature > HEALTH.TEMP_CRITICAL_C ? 'text-red-400' : v.temperature > HEALTH.TEMP_WARNING_C ? 'text-amber-400' : 'text-muted-foreground'}`}>
                        {v.temperature?.toFixed(1)}°C
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-semibold ${
                        v.healthScore >= (HEALTH.BASE_SCORE - HEALTH.PENALTY_WARNING) ? 'text-emerald-400' : v.healthScore >= (HEALTH.BASE_SCORE - HEALTH.PENALTY_CRITICAL) ? 'text-amber-400' : 'text-red-400'
                      }`}>{v.healthScore}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}