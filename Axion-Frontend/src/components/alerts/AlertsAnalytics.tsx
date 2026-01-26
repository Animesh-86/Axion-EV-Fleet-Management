import { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, TrendingDown, Brain, Filter, Link2 } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatusBadge } from '../ui/StatusBadge';

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  vehicle: string;
  timestamp: string;
  description: string;
  correlatedVehicles?: string[];
}

const alerts: Alert[] = [
  {
    id: '1',
    severity: 'critical',
    title: 'Battery Cell Degradation Detected',
    vehicle: 'V-2847',
    timestamp: '2024-12-04 14:23:15',
    description: 'AI model detected abnormal voltage drop in cell cluster 3B',
    correlatedVehicles: ['V-2841', 'V-2839'],
  },
  {
    id: '2',
    severity: 'critical',
    title: 'Motor Fault - Rear Drive Unit',
    vehicle: 'V-3241',
    timestamp: '2024-12-04 13:45:22',
    description: 'Unusual vibration pattern detected, potential bearing failure',
  },
  {
    id: '3',
    severity: 'warning',
    title: 'High Temperature Alert',
    vehicle: 'V-1923',
    timestamp: '2024-12-04 13:12:08',
    description: 'Battery temperature reached 43°C during fast charging',
    correlatedVehicles: ['V-1921', 'V-1925', 'V-1928'],
  },
  {
    id: '4',
    severity: 'warning',
    title: 'Low Battery Warning',
    vehicle: 'V-4562',
    timestamp: '2024-12-04 12:56:33',
    description: 'Battery level dropped below 15% threshold',
  },
  {
    id: '5',
    severity: 'critical',
    title: 'Communication Loss',
    vehicle: 'V-1847',
    timestamp: '2024-12-04 11:23:47',
    description: 'Vehicle telemetry connection lost for 15+ minutes',
  },
  {
    id: '6',
    severity: 'info',
    title: 'Firmware Update Available',
    vehicle: 'V-2314',
    timestamp: '2024-12-04 10:15:29',
    description: 'New firmware version v2.4.1 ready for deployment',
  },
  {
    id: '7',
    severity: 'warning',
    title: 'Tire Pressure Low',
    vehicle: 'V-5621',
    timestamp: '2024-12-04 09:34:12',
    description: 'Front-left tire pressure at 28 PSI (recommended: 42 PSI)',
  },
  {
    id: '8',
    severity: 'info',
    title: 'Charging Session Complete',
    vehicle: 'V-8934',
    timestamp: '2024-12-04 08:42:55',
    description: 'Vehicle fully charged to 100% battery',
  },
  {
    id: '9',
    severity: 'critical',
    title: 'Battery Cell Degradation Detected',
    vehicle: 'V-2841',
    timestamp: '2024-12-04 08:15:42',
    description: 'AI model detected abnormal voltage drop in cell cluster 3B',
    correlatedVehicles: ['V-2847', 'V-2839'],
  },
];

const degradationData = [
  { day: 'Day 1', capacity: 100 },
  { day: 'Day 30', capacity: 98.5 },
  { day: 'Day 60', capacity: 97.2 },
  { day: 'Day 90', capacity: 96.8 },
  { day: 'Day 120', capacity: 95.1 },
  { day: 'Day 150', capacity: 94.2 },
  { day: 'Day 180', capacity: 93.5 },
];

const alertTimeline = [
  { hour: '00:00', critical: 0, warning: 1, info: 2 },
  { hour: '04:00', critical: 1, warning: 0, info: 1 },
  { hour: '08:00', critical: 2, warning: 1, info: 3 },
  { hour: '12:00', critical: 1, warning: 3, info: 2 },
  { hour: '16:00', critical: 0, warning: 2, info: 1 },
  { hour: '20:00', critical: 1, warning: 1, info: 0 },
  { hour: '24:00', critical: 0, warning: 1, info: 1 },
];

const topIssues = [
  { issue: 'Battery Cell Degradation', occurrences: 12, trend: 'increasing', severity: 'critical' },
  { issue: 'High Temperature Alerts', occurrences: 8, trend: 'stable', severity: 'warning' },
  { issue: 'Communication Loss', occurrences: 5, trend: 'decreasing', severity: 'critical' },
  { issue: 'Motor Vibration', occurrences: 4, trend: 'increasing', severity: 'warning' },
  { issue: 'Low Battery Warnings', occurrences: 3, trend: 'stable', severity: 'warning' },
];

export function AlertsAnalytics() {
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const filteredAlerts = severityFilter === 'all' 
    ? alerts 
    : alerts.filter(a => a.severity === severityFilter);

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const infoCount = alerts.filter(a => a.severity === 'info').length;

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
          <div className="text-3xl mb-1">12</div>
          <div className="text-sm text-purple-400">Active forecasts</div>
        </motion.div>
      </div>

      {/* Alert Timeline Visualization */}
      <div className="mb-8 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6">
        <h2 className="text-lg mb-4">Alert Timeline (24h)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={alertTimeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="hour" 
              stroke="rgba(255,255,255,0.3)"
              style={{ fontSize: '11px' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.3)"
              style={{ fontSize: '11px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} />
            <Line type="monotone" dataKey="warning" stroke="#eab308" strokeWidth={2} />
            <Line type="monotone" dataKey="info" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
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
                          <p className="text-sm text-gray-400 mb-2">{alert.description}</p>
                          
                          {/* Vehicle Correlation */}
                          {alert.correlatedVehicles && alert.correlatedVehicles.length > 0 && (
                            <div className="mt-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Link2 className="w-3 h-3 text-purple-400" />
                                <span className="text-xs text-purple-400">Correlated Vehicles</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {alert.correlatedVehicles.map((vehicleId) => (
                                  <span key={vehicleId} className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300">
                                    {vehicleId}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - AI Insights */}
        <div className="col-span-5 space-y-6">
          {/* Battery Degradation Prediction */}
          <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg">Battery Degradation Prediction</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={degradationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="day" 
                  stroke="rgba(255,255,255,0.3)"
                  style={{ fontSize: '11px' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)"
                  style={{ fontSize: '11px' }}
                  domain={[90, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="capacity" 
                  stroke="#a78bfa" 
                  strokeWidth={3}
                  dot={{ fill: '#a78bfa', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-start gap-2">
                <TrendingDown className="w-4 h-4 text-purple-400 mt-0.5" />
                <div>
                  <div className="text-sm text-purple-400 mb-1">AI Insight</div>
                  <div className="text-xs text-gray-400">
                    Fleet battery capacity degrading at 0.12% per month. Within normal parameters.
                    Predicted 90% capacity retention at 3.5 years.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Recurring Issues */}
          <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6">
            <h3 className="text-lg mb-4">Top Recurring Issues</h3>
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
                      : 'bg-yellow-500/10 border-yellow-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">{issue.issue}</span>
                    <StatusBadge
                      status={issue.severity === 'critical' ? 'critical' : 'warning'}
                      label={issue.trend}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{issue.occurrences} occurrences</span>
                    <span className={`${
                      issue.trend === 'increasing' ? 'text-red-400' :
                      issue.trend === 'decreasing' ? 'text-green-400' :
                      'text-gray-400'
                    }`}>
                      {issue.trend === 'increasing' ? '↑' : issue.trend === 'decreasing' ? '↓' : '→'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Insight Box */}
          <div className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg text-cyan-400">AI Analysis</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-300">
              <p>
                <strong className="text-white">Pattern Detected:</strong> Battery degradation alerts 
                clustering in vehicles from batch #2847-2850, manufactured Q2 2023.
              </p>
              <p>
                <strong className="text-white">Recommendation:</strong> Schedule preventive maintenance 
                for 15 vehicles in this batch within 14 days.
              </p>
              <p className="text-xs text-gray-500">
                Confidence: 94% • Model: XGBoost Ensemble v3.2
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}