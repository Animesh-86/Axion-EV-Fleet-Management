import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import { Battery, Thermometer, AlertTriangle, TrendingDown, Info, TrendingUp } from 'lucide-react';

const batteryDegradation = [
  { month: 'Jan', capacity: 100, degradation: 0 },
  { month: 'Feb', capacity: 99.2, degradation: 0.8 },
  { month: 'Mar', capacity: 98.5, degradation: 1.5 },
  { month: 'Apr', capacity: 97.8, degradation: 2.2 },
  { month: 'May', capacity: 97.1, degradation: 2.9 },
  { month: 'Jun', capacity: 96.5, degradation: 3.5 },
  { month: 'Jul', capacity: 95.9, degradation: 4.1 },
  { month: 'Aug', capacity: 95.3, degradation: 4.7 },
];

const temperatureAnomalies = [
  { time: '00:00', temp: 22, threshold: 35, anomaly: false },
  { time: '04:00', temp: 20, threshold: 35, anomaly: false },
  { time: '08:00', temp: 28, threshold: 35, anomaly: false },
  { time: '12:00', temp: 38, threshold: 35, anomaly: true },
  { time: '16:00', temp: 36, threshold: 35, anomaly: true },
  { time: '20:00', temp: 26, threshold: 35, anomaly: false },
  { time: '24:00', temp: 23, threshold: 35, anomaly: false },
];

const healthScoreTrend = [
  { week: 'Week 1', score: 95, battery: 98, temp: 92, motor: 95 },
  { week: 'Week 2', score: 94, battery: 97, temp: 91, motor: 94 },
  { week: 'Week 3', score: 92, battery: 96, temp: 88, motor: 93 },
  { week: 'Week 4', score: 88, battery: 94, temp: 82, motor: 91 },
  { week: 'Week 5', score: 85, battery: 92, temp: 78, motor: 90 },
  { week: 'Week 6', score: 82, battery: 90, temp: 74, motor: 89 },
  { week: 'Week 7', score: 78, battery: 88, temp: 70, motor: 88 },
  { week: 'Week 8', score: 72, battery: 86, temp: 65, motor: 87 },
];

const healthFactors = [
  { factor: 'Battery Health', score: 86, impact: 'high', icon: Battery, color: 'emerald' },
  { factor: 'Temperature Stability', score: 65, impact: 'critical', icon: Thermometer, color: 'red' },
  { factor: 'Motor Performance', score: 87, impact: 'medium', icon: TrendingDown, color: 'amber' },
  { factor: 'System Errors', score: 92, impact: 'low', icon: AlertTriangle, color: 'emerald' },
];

export function Analytics() {
  const [selectedVehicle, setSelectedVehicle] = useState('EV-002');
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics & Health Scoring</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Advanced diagnostics and predictive insights
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
          >
            <option value="EV-002">EV-002 (Selected)</option>
            <option value="EV-001">EV-001</option>
            <option value="EV-003">EV-003</option>
            <option value="all">All Vehicles</option>
          </select>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Primary Insight Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 rounded-lg p-6"
      >
        <div className="flex items-start gap-4">
          <div className="bg-amber-500/20 p-3 rounded-lg">
            <TrendingDown className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-amber-400 mb-2">Primary Insight</h2>
            <p className="text-lg font-semibold mb-3">
              Fleet health expected to drop 6% in next 14 days
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Main Driver</p>
                <p className="font-semibold text-foreground">Temperature Instability</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Vehicles Affected</p>
                <p className="font-semibold text-foreground">36 vehicles (14.5%)</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Recommended Action</p>
                <p className="font-semibold text-primary">Schedule thermal inspections</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-amber-400 mb-1">-6%</div>
            <p className="text-sm text-muted-foreground">Predicted Change</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            <span className="text-amber-400 font-semibold">Analysis:</span> Historical data shows temperature peaks correlate with 8% health degradation. 
            Current trend suggests intervention needed before Week 10 to prevent cascade failures in low-health vehicles.
          </p>
        </div>
      </motion.div>

      {/* Health Score Explainability */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Health Score Breakdown</h2>
            <p className="text-sm text-muted-foreground">
              Understanding {selectedVehicle}'s current health score of 72/100
            </p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold text-amber-400">72</p>
            <p className="text-sm text-muted-foreground mt-1">out of 100</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {healthFactors.map((factor, index) => {
            const Icon = factor.icon;
            const getColor = (score: number) => {
              if (score >= 80) return 'emerald';
              if (score >= 60) return 'amber';
              return 'red';
            };
            const colorScheme = getColor(factor.score);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br from-${colorScheme}-500/10 to-${colorScheme}-500/5 border border-${colorScheme}-500/20 rounded-lg p-4`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`bg-${colorScheme}-500/20 p-2 rounded-lg`}>
                    <Icon className={`w-5 h-5 text-${colorScheme}-400`} />
                  </div>
                  <span
                    className={`px-2 py-0.5 bg-${colorScheme}-500/10 text-${colorScheme}-400 border border-${colorScheme}-500/20 rounded text-xs font-semibold uppercase`}
                  >
                    {factor.impact}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{factor.factor}</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-2xl font-bold text-${colorScheme}-400`}>{factor.score}</p>
                  <p className="text-sm text-muted-foreground">/100</p>
                </div>

                {/* Mini progress bar */}
                <div className="mt-3 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.score}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                    className={`h-full bg-${colorScheme}-500`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Explanation Panel */}
        <div className="mt-6 p-4 bg-background/50 border border-border/50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold mb-2">Why is this vehicle at 72% health?</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>
                    <strong className="text-red-400">Temperature instability:</strong> Multiple instances above 35°C threshold detected
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>
                    <strong className="text-amber-400">Battery degradation:</strong> 4.7% capacity loss over 8 months (normal: 3%)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>
                    <strong className="text-amber-400">Motor efficiency:</strong> Slight decrease in performance metrics
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>
                    <strong className="text-emerald-400">System stability:</strong> Low error rate, no critical failures
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Battery Degradation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-6">Battery Degradation Trend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height={288}>
              <AreaChart data={batteryDegradation}>
                <defs>
                  <linearGradient id="capacityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="degradationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#252D38" />
                <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A2028',
                    border: '1px solid #252D38',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="capacity"
                  stroke="#10B981"
                  strokeWidth={3}
                  fill="url(#capacityGradient)"
                  name="Capacity %"
                />
                <Area
                  type="monotone"
                  dataKey="degradation"
                  stroke="#EF4444"
                  strokeWidth={3}
                  fill="url(#degradationGradient)"
                  name="Degradation %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Temperature Anomalies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-6">Temperature Anomaly Detection</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height={288}>
              <BarChart data={temperatureAnomalies}>
                <defs>
                  <linearGradient id="tempBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#252D38" />
                <XAxis dataKey="time" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A2028',
                    border: '1px solid #252D38',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="temp"
                  fill="url(#tempBarGradient)"
                  name="Temperature °C"
                  radius={[8, 8, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="threshold"
                  stroke="#EF4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Threshold"
                  dot={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-semibold">2 anomalies detected</span>
            <span className="text-muted-foreground">in the last 24 hours</span>
          </div>
        </motion.div>
      </div>

      {/* Health Score Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <h2 className="text-lg font-semibold mb-6">Health Score Trend (8 Weeks)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={healthScoreTrend}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="batteryHealthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tempHealthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#252D38" />
              <XAxis dataKey="week" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A2028',
                  border: '1px solid #252D38',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#6C63FF"
                strokeWidth={3}
                dot={{ fill: '#6C63FF', r: 5 }}
                name="Overall Health"
                fill="url(#scoreGradient)"
              />
              <Line
                type="monotone"
                dataKey="battery"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 4 }}
                name="Battery"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ fill: '#F59E0B', r: 4 }}
                name="Temperature"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="motor"
                stroke="#00E5FF"
                strokeWidth={2}
                dot={{ fill: '#00E5FF', r: 4 }}
                name="Motor"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}