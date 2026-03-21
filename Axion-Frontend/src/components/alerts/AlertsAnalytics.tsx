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
    <div className="p-8 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Alerts & Analytics</h1>
        <p className="text-gray-500">AI-powered anomaly detection with vehicle correlation</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 p-6 border border-red-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Critical Alerts</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl mb-1">{criticalCount}</div>
          <div className="text-sm text-red-400">Requires immediate attention</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 p-6 border border-yellow-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Warnings</span>
            <AlertCircle className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-3xl mb-1">{warningCount}</div>
          <div className="text-sm text-yellow-400">Monitor closely</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6 border border-blue-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Info</span>
            <Info className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl mb-1">{infoCount}</div>
          <div className="text-sm text-blue-400">Informational</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-6 border border-purple-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">AI Predictions</span>
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl mb-1">{alerts.length}</div>
          <div className="text-sm text-purple-400">Total active alerts</div>
        </motion.div>
      </div>

      {/* Alert Timeline — live trend */}
      <div className="mb-8 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6">
        <h2 className="text-lg mb-4">Alert Trend (live)</h2>
        {alertHistory.length > 1 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={alertHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px' }} />
              <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px' }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef444433" />
              <Area type="monotone" dataKey="warning" stackId="1" stroke="#eab308" fill="#eab30833" />
              <Area type="monotone" dataKey="info" stackId="1" stroke="#3b82f6" fill="#3b82f633" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">Collecting alert trend data...</div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Alerts List */}
        <div className="col-span-7">
          <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg">Alert Feed</h2>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value as any)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm"
                  >
                    <option value="all">All Severity</option>
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="max-h-[900px] overflow-y-auto">
              <div className="divide-y divide-white/10">
                {filteredAlerts.map((alert, index) => {
                  const Icon = getIcon(alert.severity);
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          alert.severity === 'critical' ? 'bg-red-500/10' :
                          alert.severity === 'warning' ? 'bg-yellow-500/10' :
                          'bg-blue-500/10'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            alert.severity === 'critical' ? 'text-red-400' :
                            alert.severity === 'warning' ? 'text-yellow-400' :
                            'text-blue-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-sm">{alert.title}</h3>
                            <StatusBadge
                              status={alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'info'}
                              label={alert.severity}
                              size="sm"
                            />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <span>{alert.vehicle}</span>
                            <span>•</span>
                            <span>{alert.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-400">{alert.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Insights */}
        <div className="col-span-5 space-y-6">
          {/* Alert Summary Breakdown */}
          <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg">Alert Breakdown</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Critical', count: criticalCount, color: 'bg-red-500', textColor: 'text-red-400' },
                { label: 'Warning', count: warningCount, color: 'bg-yellow-500', textColor: 'text-yellow-400' },
                { label: 'Info', count: infoCount, color: 'bg-blue-500', textColor: 'text-blue-400' },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">{row.label}</span>
                    <span className={`text-sm font-semibold ${row.textColor}`}>{row.count}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${row.color}`}
                      style={{ width: alerts.length > 0 ? `${(row.count / alerts.length) * 100}%` : '0%' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-start gap-2">
                <TrendingDown className="w-4 h-4 text-purple-400 mt-0.5" />
                <div className="text-xs text-gray-400">
                  Alerts are derived in real time from fleet telemetry using thresholds:
                  SOC &lt; {HEALTH.SOC_CRITICAL_PCT}% (critical), Temp &gt; {HEALTH.TEMP_CRITICAL_C}°C (critical),
                  SOC &lt; {HEALTH.SOC_WARNING_PCT}% (warning), Temp &gt; {HEALTH.TEMP_WARNING_C}°C (warning).
                </div>
              </div>
            </div>
          </div>

          {/* Top Issues — derived from live alerts */}
          <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6">
            <h3 className="text-lg mb-4">Top Issues</h3>
            {topIssues.length > 0 ? (
              <div className="space-y-3">
                {topIssues.map((issue, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border ${
                      issue.severity === 'critical'
                        ? 'bg-red-500/10 border-red-500/20'
                        : issue.severity === 'warning'
                        ? 'bg-yellow-500/10 border-yellow-500/20'
                        : 'bg-blue-500/10 border-blue-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{issue.issue}</span>
                      <StatusBadge
                        status={issue.severity === 'critical' ? 'critical' : issue.severity === 'warning' ? 'warning' : 'info'}
                        label={issue.severity}
                        size="sm"
                      />
                    </div>
                    <div className="text-xs text-gray-400">{issue.occurrences} vehicle{issue.occurrences !== 1 ? 's' : ''} affected</div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-6">No active issues — fleet healthy</div>
            )}
          </div>

          {/* Threshold Reference */}
          <div className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg text-cyan-400">Health Rules</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between"><span>Base Health Score</span><span className="font-mono">{HEALTH.BASE_SCORE}</span></div>
              <div className="flex justify-between"><span>SOC Critical</span><span className="font-mono text-red-400">&lt; {HEALTH.SOC_CRITICAL_PCT}%</span></div>
              <div className="flex justify-between"><span>SOC Warning</span><span className="font-mono text-yellow-400">&lt; {HEALTH.SOC_WARNING_PCT}%</span></div>
              <div className="flex justify-between"><span>Temp Warning</span><span className="font-mono text-yellow-400">&gt; {HEALTH.TEMP_WARNING_C}°C</span></div>
              <div className="flex justify-between"><span>Temp Critical</span><span className="font-mono text-red-400">&gt; {HEALTH.TEMP_CRITICAL_C}°C</span></div>
              <div className="flex justify-between"><span>Penalty (Warning)</span><span className="font-mono">-{HEALTH.PENALTY_WARNING}</span></div>
              <div className="flex justify-between"><span>Penalty (Critical)</span><span className="font-mono">-{HEALTH.PENALTY_CRITICAL}</span></div>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Thresholds are configured in backend application.properties and mirrored here for display.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}