import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Battery, Thermometer, Heart, Wifi, WifiOff, TrendingUp, Activity, BrainCircuit, AlertTriangle } from 'lucide-react';
import { POLL_ANALYTICS, TELEMETRY_HISTORY_WINDOW, HEALTH } from '../../config';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, LineChart, Line, AreaChart, Area,
} from 'recharts';
import { AxionApi, FleetSummary, FleetVehicle, FleetRiskItem } from '../../services/api';

const HEALTH_COLORS = { HEALTHY: '#10b981', DEGRADED: '#f59e0b', CRITICAL: '#ef4444' };

export function Analytics() {
  const [summary, setSummary] = useState<FleetSummary | null>(null);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [healthHistory, setHealthHistory] = useState<{ time: string; healthy: number; degraded: number; critical: number }[]>([]);
  const [batteryHistory, setBatteryHistory] = useState<{ time: string; avg: number; min: number; max: number }[]>([]);
  const [riskRanking, setRiskRanking] = useState<FleetRiskItem[]>([]);
  const [riskPage, setRiskPage] = useState(0);
  const RISK_PAGE_SIZE = 100;
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

        // Fetch ML risk ranking
        try {
          const ranking = await AxionApi.getFleetRiskRanking();
          setRiskRanking(ranking);
        } catch { /* ML service may be unavailable */ }
      } catch { /* offline */ }
    };
    fetch();
    const id = setInterval(fetch, POLL_ANALYTICS);
    return () => clearInterval(id);
  }, []);

  const healthDist = summary ? [
    { name: 'HEALTHY', value: summary.healthy, color: '#10B981' },
    { name: 'DEGRADED', value: summary.degraded, color: '#F59E0B' },
    { name: 'CRITICAL', value: summary.critical, color: '#EF4444' },
  ].filter(d => d.value > 0) : [];

  const batteryBuckets = () => {
    const buckets = [
      { range: '0-20%', count: 0, color: '#EF4444' },
      { range: '21-40%', count: 0, color: '#F97316' },
      { range: '41-60%', count: 0, color: '#EAB308' },
      { range: '61-80%', count: 0, color: '#22C55E' },
      { range: '81-100%', count: 0, color: '#10B981' },
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
      { range: '<25°C', count: 0, color: '#3B82F6' },
      { range: '25-35°C', count: 0, color: '#10B981' },
      { range: `35-${HEALTH.TEMP_WARNING_C}°C`, count: 0, color: '#F59E0B' },
      { range: `${HEALTH.TEMP_WARNING_C}-${HEALTH.TEMP_CRITICAL_C}°C`, count: 0, color: '#F97316' },
      { range: `>${HEALTH.TEMP_CRITICAL_C}°C`, count: 0, color: '#EF4444' },
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
    { label: 'FLEET_UPTIME', value: `${onlinePercent}%`, icon: Wifi, color: 'text-emerald-400' },
    { label: 'AVG_SOC_RESERVE', value: `${avgBattery}%`, icon: Battery, color: 'text-primary' },
    { label: 'AVG_THERMAL_LOAD', value: `${avgTemp}°C`, icon: Thermometer, color: 'text-amber-400' },
    { label: 'FLEET_INTEGRITY', value: avgHealth, icon: Heart, color: 'text-purple-400' },
  ];

  const tooltipStyle = {
    contentStyle: { backgroundColor: 'rgba(6, 7, 9, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' as const, color: '#E5E7EB', backdropFilter: 'blur(8px)' },
    itemStyle: { padding: '2px 0' },
    cursor: { stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-precision">Fleet_Analytics</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mt-2 opacity-50">
             AGGREGATE_PERFORMANCE_METRICS • TELEMETRY_DISTRIBUTION
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-6 border-white/5"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">{kpi.label}</span>
                <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
              <div className={`text-3xl font-black tracking-tighter text-precision ${kpi.color}`}>{kpi.value}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Health Distribution */}
        <div className="col-span-12 lg:col-span-4">
          <div className="glass-card p-6 h-full border-white/5">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-8 flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-purple-400" />
              Integrity_Distribution
            </h2>
            {healthDist.length > 0 ? (
              <div className="flex flex-col items-center">
                <div className="w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={healthDist} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                        {healthDist.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.8} />)}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 w-full gap-2 mt-4">
                  {healthDist.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color, boxShadow: `0 0 10px ${d.color}` }} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{d.name}</span>
                      </div>
                      <span className="text-xs font-black text-precision">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-20 italic">No_Telemetry_Data</div>
            )}
          </div>
        </div>

        {/* Battery SOC Distribution */}
        <div className="col-span-12 lg:col-span-8">
          <div className="glass-card p-6 h-full border-white/5">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-8 flex items-center gap-2">
              <Battery className="w-3.5 h-3.5 text-primary" />
              SOC_Reserve_Density
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batteryBuckets()}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="range" stroke="rgba(255,255,255,0.2)" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} />
                  <YAxis stroke="rgba(255,255,255,0.2)" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]} barSize={40}>
                    {batteryBuckets().map((b, i) => <Cell key={i} fill={b.color} fillOpacity={0.6} stroke={b.color} strokeWidth={1} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Temperature Distribution */}
        <div className="col-span-12 lg:col-span-6">
          <div className="glass-card p-6 border-white/5">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-8 flex items-center gap-2">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              Thermal_Load_Variance
            </h2>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tempBuckets()} layout="vertical">
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.2)" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} hide />
                  <YAxis type="category" dataKey="range" stroke="rgba(255,255,255,0.2)" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} width={80} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" radius={[0, 2, 2, 0]} barSize={24}>
                    {tempBuckets().map((b, i) => <Cell key={i} fill={b.color} fillOpacity={0.6} stroke={b.color} strokeWidth={1} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Connectivity Ratio */}
        <div className="col-span-12 lg:col-span-6">
          <div className="glass-card p-6 border-white/5">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-8 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Connectivity_Sync_Ratio
            </h2>
            {summary && summary.totalVehicles > 0 ? (
              <div className="flex items-center justify-around h-[240px]">
                <div className="w-[180px] h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[
                        { name: 'ONLINE', value: summary.onlineVehicles, color: '#10B981' },
                        { name: 'OFFLINE', value: summary.totalVehicles - summary.onlineVehicles, color: '#374151' },
                      ]} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                        <Cell fill="#10B981" fillOpacity={0.8} />
                        <Cell fill="#1F2937" />
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/5 border border-emerald-500/20 rounded">
                       <Wifi className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-precision leading-none">{summary.onlineVehicles}</div>
                      <div className="text-[9px] font-black text-emerald-400/60 uppercase tracking-widest mt-1">NODES_ONLINE</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/5 border border-white/10 rounded">
                       <WifiOff className="w-4 h-4 text-muted-foreground opacity-40" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-precision leading-none opacity-40">{summary.totalVehicles - summary.onlineVehicles}</div>
                      <div className="text-[9px] font-black text-muted-foreground opacity-40 uppercase tracking-widest mt-1">NODES_OFFLINE</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-20 italic">No_Telemetry_Data</div>
            )}
          </div>
        </div>

        {/* Health Trend */}
        <div className="col-span-12 lg:col-span-6">
          <div className="glass-card p-6 border-white/5">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-8 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
              State_Propagation_Trend
            </h2>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthHistory}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900 }} />
                  <YAxis stroke="rgba(255,255,255,0.2)" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="healthy" stackId="1" stroke="#10B981" fill="url(#colorHealthy)" fillOpacity={1} strokeWidth={2} />
                  <Area type="monotone" dataKey="degraded" stackId="1" stroke="#F59E0B" fill="url(#colorDegraded)" fillOpacity={1} strokeWidth={2} />
                  <Area type="monotone" dataKey="critical" stackId="1" stroke="#EF4444" fill="url(#colorCritical)" fillOpacity={1} strokeWidth={2} />
                  <defs>
                    <linearGradient id="colorHealthy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDegraded" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Battery SOC Trend */}
        <div className="col-span-12 lg:col-span-6">
          <div className="glass-card p-6 border-white/5">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-8 flex items-center gap-2">
              <Battery className="w-3.5 h-3.5 text-primary" />
              Mean_SOC_Historical_Delta
            </h2>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={batteryHistory}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900 }} />
                  <YAxis stroke="rgba(255,255,255,0.2)" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} domain={[0, 100]} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="avg" stroke="#00E5FF" strokeWidth={3} dot={false} name="AVG_RESERVE" shadow="0 0 10px #00E5FF" />
                  <Line type="step" dataKey="min" stroke="#EF4444" strokeWidth={1} strokeDasharray="4 4" dot={false} name="MIN_NODE" />
                  <Line type="step" dataKey="max" stroke="#10B981" strokeWidth={1} strokeDasharray="4 4" dot={false} name="MAX_NODE" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Fleet Risk Heatmap (ML-Powered) */}
        <div className="col-span-12">
          <div className="glass-card p-6 border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40 flex items-center gap-2">
                <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                ML_Fleet_Risk_Heatmap
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-[8px] font-black text-purple-400/60 uppercase tracking-widest">XGBoost + Isolation Forest</span>
              </div>
            </div>
            {riskRanking.length > 0 ? (
              <>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                {riskRanking.slice(riskPage * RISK_PAGE_SIZE, (riskPage + 1) * RISK_PAGE_SIZE).map((item) => {
                  const riskPct = Math.round(item.riskScore * 100);
                  const riskColor = item.riskScore >= 0.7 ? 'from-red-500/30 to-red-900/20 border-red-500/40' :
                    item.riskScore >= 0.4 ? 'from-amber-500/20 to-amber-900/10 border-amber-500/30' :
                    'from-emerald-500/10 to-emerald-900/5 border-emerald-500/20';
                  const textColor = item.riskScore >= 0.7 ? 'text-red-400' :
                    item.riskScore >= 0.4 ? 'text-amber-400' : 'text-emerald-400';
                  return (
                    <motion.div
                      key={item.vehicleId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`relative p-3 rounded-lg border bg-gradient-to-br ${riskColor} group hover:scale-105 transition-transform cursor-default`}
                    >
                      {item.riskScore >= 0.7 && (
                        <AlertTriangle className="absolute top-1.5 right-1.5 w-3 h-3 text-red-400 animate-pulse" />
                      )}
                      <div className="text-[10px] font-black font-mono text-precision mb-1 truncate">{item.vehicleId}</div>
                      <div className={`text-lg font-black ${textColor} leading-none`}>{riskPct}%</div>
                      <div className="mt-1.5 h-1 bg-black/30 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${item.riskScore >= 0.7 ? 'bg-red-500' : item.riskScore >= 0.4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${riskPct}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-[12px] text-muted-foreground">Showing {(riskPage * RISK_PAGE_SIZE) + 1}–{Math.min((riskPage + 1) * RISK_PAGE_SIZE, riskRanking.length)} of {riskRanking.length}</div>
                <div className="flex gap-2">
                  <button disabled={riskPage === 0} onClick={() => setRiskPage(p => Math.max(0, p - 1))} className="px-3 py-1 bg-white/5 rounded disabled:opacity-40">Prev</button>
                  <button disabled={(riskPage + 1) * RISK_PAGE_SIZE >= riskRanking.length} onClick={() => setRiskPage(p => p + 1)} className="px-3 py-1 bg-white/5 rounded disabled:opacity-40">Next</button>
                </div>
              </div>
              </>
            ) : (
              <div className="h-[120px] flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-20 italic">Awaiting_ML_Risk_Data</div>
            )}
          </div>
        </div>

        {/* Vehicle Performance Ranking */}
        <div className="col-span-12">
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40">System_Integrity_Ranking</h2>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 border-b border-white/5 bg-white/[0.02]">
                    <th className="text-left p-6 font-black">Node_Identity</th>
                    <th className="text-left p-6 font-black">Sync_State</th>
                    <th className="text-left p-6 font-black">Integrity_Class</th>
                    <th className="text-left p-6 font-black">SOC_Level</th>
                    <th className="text-left p-6 font-black">Thermal_State</th>
                    <th className="text-right p-6 font-black">Integrity_Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[...vehicles].sort((a, b) => a.healthScore - b.healthScore).map(v => (
                    <tr key={v.vehicleId} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-6">
                        <div className="text-xs font-black font-mono text-precision group-hover:text-primary transition-colors">{v.vehicleId}</div>
                      </td>
                      <td className="p-6">
                        <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${v.online ? 'text-emerald-400' : 'text-muted-foreground opacity-30'}`}>
                          <div className={`w-1 h-1 rounded-full ${v.online ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' : 'bg-white/20'}`} />
                          {v.online ? 'SYNCED' : 'OFFLINE'}
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase tracking-tighter ${
                          v.healthState === 'HEALTHY' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' :
                          v.healthState === 'DEGRADED' ? 'bg-amber-500/5 text-amber-400 border-amber-500/20' :
                          'bg-red-500/5 text-red-400 border-red-500/20'
                        }`}>{v.healthState}</span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${v.battery > HEALTH.SOC_WARNING_PCT ? 'bg-emerald-400' : v.battery > HEALTH.SOC_CRITICAL_PCT ? 'bg-amber-400' : 'bg-red-400'}`}
                              style={{ width: `${v.battery}%` }} />
                          </div>
                          <span className="text-[10px] font-black font-mono text-precision">{v.battery?.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className={`text-[10px] font-black font-mono ${v.temperature > HEALTH.TEMP_CRITICAL_C ? 'text-red-400' : v.temperature > HEALTH.TEMP_WARNING_C ? 'text-amber-400' : 'text-precision opacity-60'}`}>
                          {v.temperature?.toFixed(1)}°C
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className={`text-sm font-black tracking-tighter ${
                          v.healthScore >= (HEALTH.BASE_SCORE - HEALTH.PENALTY_WARNING) ? 'text-emerald-400' : v.healthScore >= (HEALTH.BASE_SCORE - HEALTH.PENALTY_CRITICAL) ? 'text-amber-400' : 'text-red-400'
                        }`}>{v.healthScore}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}