import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, AlertCircle, Info, TrendingDown, Brain, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { StatusBadge } from '../ui/StatusBadge';
import { AxionApi, FleetVehicle } from '../../services/api';
import { POLL_ALERTS, HEALTH, TELEMETRY_HISTORY_WINDOW } from '../../config';

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  vehicle: string;
  timestamp: string;
  description: string;
}

function generateAlerts(vehicles: FleetVehicle[]): Alert[] {
  const alerts: Alert[] = [];

  vehicles.forEach(v => {
    const ts = v.lastSeen || new Date().toISOString();

    if (v.healthState === 'CRITICAL') {
      alerts.push({
        id: `${v.vehicleId}-health`,
        severity: 'critical',
        title: 'Critical Health Score',
        vehicle: v.vehicleId,
        timestamp: ts,
        description: `Health score dropped to ${v.healthScore}. Immediate inspection recommended.`,
      });
    }

    if (v.battery != null && v.battery < HEALTH.SOC_CRITICAL_PCT) {
      alerts.push({
        id: `${v.vehicleId}-soc-crit`,
        severity: 'critical',
        title: 'Battery Critically Low',
        vehicle: v.vehicleId,
        timestamp: ts,
        description: `Battery at ${v.battery.toFixed(1)}% — below ${HEALTH.SOC_CRITICAL_PCT}% critical threshold.`,
      });
    } else if (v.battery != null && v.battery < HEALTH.SOC_WARNING_PCT) {
      alerts.push({
        id: `${v.vehicleId}-soc-warn`,
        severity: 'warning',
        title: 'Low Battery Warning',
        vehicle: v.vehicleId,
        timestamp: ts,
        description: `Battery at ${v.battery.toFixed(1)}% — below ${HEALTH.SOC_WARNING_PCT}% warning threshold.`,
      });
    }

    if (v.temperature != null && v.temperature > HEALTH.TEMP_CRITICAL_C) {
      alerts.push({
        id: `${v.vehicleId}-temp-crit`,
        severity: 'critical',
        title: 'Battery Over-Temperature',
        vehicle: v.vehicleId,
        timestamp: ts,
        description: `Temperature at ${v.temperature.toFixed(1)}°C — exceeds ${HEALTH.TEMP_CRITICAL_C}°C critical limit.`,
      });
    } else if (v.temperature != null && v.temperature > HEALTH.TEMP_WARNING_C) {
      alerts.push({
        id: `${v.vehicleId}-temp-warn`,
        severity: 'warning',
        title: 'High Temperature Alert',
        vehicle: v.vehicleId,
        timestamp: ts,
        description: `Temperature at ${v.temperature.toFixed(1)}°C — above ${HEALTH.TEMP_WARNING_C}°C warning threshold.`,
      });
    }

    if (!v.online) {
      alerts.push({
        id: `${v.vehicleId}-offline`,
        severity: 'warning',
        title: 'Vehicle Offline',
        vehicle: v.vehicleId,
        timestamp: ts,
        description: `Telemetry connection lost. Last seen: ${ts}`,
      });
    }

    if (v.healthState === 'DEGRADED') {
      alerts.push({
        id: `${v.vehicleId}-degraded`,
        severity: 'info',
        title: 'Degraded Health',
        vehicle: v.vehicleId,
        timestamp: ts,
        description: `Health score at ${v.healthScore} — vehicle in degraded state. Monitor closely.`,
      });
    }
  });

  const order: Record<string, number> = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => order[a.severity] - order[b.severity]);
  return alerts;
}

function deriveTopIssues(alerts: Alert[]) {
  const counts: Record<string, { count: number; severity: string }> = {};
  alerts.forEach(a => {
    if (!counts[a.title]) counts[a.title] = { count: 0, severity: a.severity };
    counts[a.title].count++;
  });
  return Object.entries(counts)
    .map(([issue, { count, severity }]) => ({ issue, occurrences: count, severity }))
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 5);
}

export function AlertsAnalytics() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [alertHistory, setAlertHistory] = useState<{ time: string; critical: number; warning: number; info: number }[]>([]);
  const historyRef = useRef([] as typeof alertHistory);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const vehicles = await AxionApi.getFleetVehicles();
        const generated = generateAlerts(vehicles);
        setAlerts(generated);

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const entry = {
          time: now,
          critical: generated.filter(a => a.severity === 'critical').length,
          warning: generated.filter(a => a.severity === 'warning').length,
          info: generated.filter(a => a.severity === 'info').length,
        };
        const prev = historyRef.current;
        const updated = [...prev, entry].slice(-TELEMETRY_HISTORY_WINDOW);
        historyRef.current = updated;
        setAlertHistory(updated);
      } catch { /* backend offline */ }
    };
    fetchAlerts();
    const id = setInterval(fetchAlerts, POLL_ALERTS);
    return () => clearInterval(id);
  }, []);

  const filteredAlerts = severityFilter === 'all'
    ? alerts
    : alerts.filter(a => a.severity === severityFilter);

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const infoCount = alerts.filter(a => a.severity === 'info').length;
  const topIssues = deriveTopIssues(alerts);

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return AlertTriangle;
      case 'warning':
        return AlertCircle;
      default:
        return Info;
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-precision">Alert_Orchestration</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mt-2 opacity-50">
             AI_ANOMALY_ENGINE • REAL-TIME FAULT DETECTION LAYER
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'CRITICAL', count: criticalCount, icon: AlertTriangle, color: 'text-red-400', border: 'border-red-500/20', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.1)]' },
          { label: 'WARNING', count: warningCount, icon: AlertCircle, color: 'text-amber-400', border: 'border-amber-500/20', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]' },
          { label: 'INFO', count: infoCount, icon: Info, color: 'text-blue-400', border: 'border-blue-500/20', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.1)]' },
          { label: 'AI_ANOMALIES', count: alerts.length, icon: Brain, color: 'text-primary', border: 'border-primary/20', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card p-6 ${stat.border} ${stat.glow}`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">{stat.label}</span>
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
            </div>
            <div className="text-3xl font-black tracking-tighter text-precision">{stat.count}</div>
          </motion.div>
        ))}
      </div>

      {/* Alert Timeline */}
      <div className="glass-card p-6 overflow-hidden">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-8">FAULT_PROPAGATION_TIMELINE</h2>
        <div className="h-48">
          {alertHistory.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={alertHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={9} axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0D0F14', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }} />
                <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef444411" isAnimationActive={false} />
                <Area type="monotone" dataKey="warning" stackId="1" stroke="#eab308" fill="#eab30811" isAnimationActive={false} />
                <Area type="monotone" dataKey="info" stackId="1" stroke="#3b82f6" fill="#3b82f611" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30 italic">Synchronizing_Timeline...</div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Alerts List */}
        <div className="col-span-12 lg:col-span-8">
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40">Live_Fault_Feed</h2>
                <div className="flex items-center gap-4">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground opacity-40" />
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value as any)}
                    className="bg-white/5 border border-white/10 rounded px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground focus:border-primary/50 transition-colors"
                  >
                    <option value="all">ALL_SEVERITY</option>
                    <option value="critical">CRITICAL</option>
                    <option value="warning">WARNING</option>
                    <option value="info">INFO</option>
                  </select>
                </div>
            </div>

            <div className="max-h-[800px] overflow-y-auto divide-y divide-white/5">
              {filteredAlerts.length > 0 ? filteredAlerts.map((alert, index) => {
                const Icon = getIcon(alert.severity);
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="p-6 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-6">
                      <div className={`p-3 rounded-lg border ${
                        alert.severity === 'critical' ? 'bg-red-500/5 border-red-500/20' :
                        alert.severity === 'warning' ? 'bg-amber-500/5 border-amber-500/20' :
                        'bg-blue-500/5 border-blue-500/20'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          alert.severity === 'critical' ? 'text-red-400' :
                          alert.severity === 'warning' ? 'text-amber-400' :
                          'text-blue-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-sm font-black uppercase tracking-tight text-precision group-hover:text-primary transition-colors">{alert.title}</h3>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border ${
                             alert.severity === 'critical' ? 'text-red-400 border-red-500/20 bg-red-500/5' :
                             alert.severity === 'warning' ? 'text-amber-400 border-amber-500/20 bg-amber-500/5' :
                             'text-blue-400 border-blue-500/20 bg-blue-500/5'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-30 mb-3">
                          <span className="text-primary opacity-100">{alert.vehicle}</span>
                          <span>|</span>
                          <span>{alert.timestamp}</span>
                        </div>
                        <p className="text-xs text-muted-foreground opacity-60 leading-relaxed max-w-2xl">{alert.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              }) : (
                 <div className="p-12 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-30">NO_ACTIVE_FAULTS_DETECTED</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Insights */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Breakdown */}
          <div className="glass-card p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-8">FAULT_DISTRIBUTION</h3>
            <div className="space-y-6">
              {[
                { label: 'CRITICAL', count: criticalCount, color: 'bg-red-500', textColor: 'text-red-400' },
                { label: 'WARNING', count: warningCount, color: 'bg-amber-500', textColor: 'text-amber-400' },
                { label: 'INFO', count: infoCount, color: 'bg-blue-500', textColor: 'text-blue-400' },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{row.label}</span>
                    <span className={`text-xs font-black ${row.textColor} text-precision`}>{row.count}</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${row.color}`}
                      style={{ width: alerts.length > 0 ? `${(row.count / alerts.length) * 100}%` : '0%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Issues */}
          <div className="glass-card p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-8">NODE_FAILURE_MODES</h3>
            {topIssues.length > 0 ? (
              <div className="space-y-4">
                {topIssues.map((issue, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded border transition-all ${
                      issue.severity === 'critical' ? 'bg-red-500/5 border-red-500/10' :
                      issue.severity === 'warning' ? 'bg-amber-500/5 border-amber-500/10' :
                      'bg-blue-500/5 border-blue-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-tight text-precision">{issue.issue}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                         issue.severity === 'critical' ? 'text-red-400' :
                         issue.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'
                      }`}>[{issue.severity}]</span>
                    </div>
                    <div className="text-[9px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest">{issue.occurrences} NODES_AFFECTED</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30 text-center py-8 italic">NOMINAL_STATE_DETECTED</div>
            )}
          </div>

          {/* Rules Reference */}
          <div className="glass-card p-6 border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-black uppercase tracking-widest text-precision">Engine_Heuristics</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'ENERGY_MIN', val: `${HEALTH.SOC_CRITICAL_PCT}%`, color: 'text-red-400' },
                { label: 'ENERGY_WARN', val: `${HEALTH.SOC_WARNING_PCT}%`, color: 'text-amber-400' },
                { label: 'THERMAL_MAX', val: `${HEALTH.TEMP_CRITICAL_C}°C`, color: 'text-red-400' },
                { label: 'THERMAL_WARN', val: `${HEALTH.TEMP_WARNING_C}°C`, color: 'text-amber-400' },
              ].map((rule, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                  <span className="text-muted-foreground opacity-40">{rule.label}</span>
                  <span className={`font-black ${rule.color} text-precision`}>{rule.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}