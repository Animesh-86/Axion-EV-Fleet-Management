import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Car, Wifi, WifiOff, Heart, Upload, TrendingUp, AlertTriangle, Battery, Thermometer } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid 
} from 'recharts';

const sparklineData = [
  { value: 230 }, { value: 234 }, { value: 238 }, { value: 235 }, 
  { value: 240 }, { value: 245 }, { value: 248 }
];

const healthDistribution = [
  { name: 'Healthy', value: 198, color: '#10B981' },
  { name: 'Warning', value: 36, color: '#F59E0B' },
  { name: 'Critical', value: 14, color: '#EF4444' },
];

const telemetryStream = [
  { id: 'EV-234', event: 'Battery Update', value: '87% → 85%', time: '14:32:15' },
  { id: 'EV-156', event: 'Speed Change', value: '65 km/h → 72 km/h', time: '14:32:10' },
  { id: 'EV-089', event: 'Temperature Alert', value: '38°C', time: '14:32:05' },
  { id: 'EV-201', event: 'Location Update', value: 'Zone A → Zone B', time: '14:31:58' },
  { id: 'EV-145', event: 'Charge Started', value: '45%', time: '14:31:52' },
];

const actionRequiredItems = [
  { 
    id: 1, 
    severity: 'critical', 
    title: '2 vehicles blocked from OTA due to low battery',
    description: 'EV-004, EV-008 have battery levels below 20%',
    action: 'Schedule charging or exclude from rollout',
    icon: Battery
  },
  { 
    id: 2, 
    severity: 'warning', 
    title: '1 vehicle requires thermal inspection',
    description: 'EV-002 showing temperature instability (38°C peaks)',
    action: 'Dispatch maintenance team',
    icon: Thermometer
  },
  { 
    id: 3, 
    severity: 'critical', 
    title: 'Security Hotfix rollout paused – approval needed',
    description: 'OTA-003 paused after 2 failures detected in canary phase',
    action: 'Review failure logs and approve rollback',
    icon: AlertTriangle
  },
];

const fleetTrend = [
  { time: '00:00', battery: 78, temp: 22, health: 85 },
  { time: '04:00', battery: 72, temp: 20, health: 84 },
  { time: '08:00', battery: 65, temp: 25, health: 83 },
  { time: '12:00', battery: 58, temp: 28, health: 82 },
  { time: '16:00', battery: 62, temp: 26, health: 83 },
  { time: '20:00', battery: 68, temp: 24, health: 85 },
  { time: '24:00', battery: 75, temp: 21, health: 86 },
];

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
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
  const kpiCards = [
    {
      title: 'Total Vehicles',
      value: 248,
      icon: Car,
      trend: '+12',
      color: 'from-cyan-500/20 to-cyan-500/5',
      iconBg: 'bg-cyan-500/10',
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/20',
    },
    {
      title: 'Online',
      value: 234,
      suffix: '/248',
      icon: Wifi,
      trend: '+8',
      color: 'from-emerald-500/20 to-emerald-500/5',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Offline',
      value: 14,
      icon: WifiOff,
      trend: '-3',
      color: 'from-gray-500/20 to-gray-500/5',
      iconBg: 'bg-gray-500/10',
      iconColor: 'text-gray-400',
      borderColor: 'border-gray-500/20',
    },
    {
      title: 'Avg Health Score',
      value: 87,
      suffix: '/100',
      icon: Heart,
      trend: '+2.4',
      color: 'from-violet-500/20 to-violet-500/5',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-400',
      borderColor: 'border-violet-500/20',
    },
    {
      title: 'Active OTA Campaigns',
      value: 3,
      icon: Upload,
      trend: '+1',
      color: 'from-indigo-500/20 to-indigo-500/5',
      iconBg: 'bg-indigo-500/10',
      iconColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/20',
    },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Fleet Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time monitoring and telemetry</p>
      </div>

      {/* Action Required Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border-l-4 border-red-500 rounded-lg p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-500/20 p-2 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-red-400">Action Required ({actionRequiredItems.length})</h2>
            <p className="text-sm text-muted-foreground">Critical items requiring operator attention</p>
          </div>
        </div>

        <div className="space-y-3">
          {actionRequiredItems.map((item, index) => {
            const Icon = item.icon;
            const severityConfig = item.severity === 'critical' 
              ? { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400' }
              : { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400' };

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${severityConfig.bg} border ${severityConfig.border} rounded-lg p-4 hover:border-primary/30 transition-all group cursor-pointer`}
              >
                <div className="flex items-start gap-4">
                  <div className={`${severityConfig.badge} p-2 rounded-lg mt-1`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className={`font-semibold ${severityConfig.text}`}>{item.title}</h3>
                      <span className={`${severityConfig.badge} px-2 py-0.5 rounded text-xs font-semibold uppercase shrink-0`}>
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Recommended:</span>
                      <span className="text-xs font-medium text-primary">{item.action}</span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-semibold hover:bg-primary/20">
                    Take Action
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 0 20px rgba(0, 229, 255, 0.15)',
                transition: { duration: 0.2 }
              }}
              className={`bg-gradient-to-br ${card.color} border ${card.borderColor} rounded-lg p-5 relative overflow-hidden group cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.iconBg} p-2.5 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>{card.trend}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{card.title}</p>
                <div className="flex items-baseline gap-1">
                  <AnimatedCounter value={card.value} />
                  {card.suffix && <span className="text-lg text-muted-foreground">{card.suffix}</span>}
                </div>
              </div>

              {/* Sparkline */}
              <div className="mt-3 h-8 opacity-50">
                <ResponsiveContainer width="100%" height={32}>
                  <LineChart data={sparklineData}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={card.iconColor.replace('text-', '#')} 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-300" />
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Health Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-lg p-6 lg:col-span-1"
        >
          <h2 className="text-lg font-semibold mb-6">Fleet Health Distribution</h2>
          
          <div className="h-48 mb-6">
            <ResponsiveContainer width="100%" height={192}>
              <PieChart>
                <Pie
                  data={healthDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {healthDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1A2028', 
                    border: '1px solid #252D38',
                    borderRadius: '8px' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {healthDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Live Telemetry Stream */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-lg p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Live Telemetry Stream</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">Real-time</span>
            </div>
          </div>

          <div className="space-y-2">
            {telemetryStream.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="flex items-center justify-between p-3 bg-background/50 border border-border/50 rounded-lg hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-primary">{event.id}</span>
                  <span className="text-sm text-foreground">{event.event}</span>
                  <span className="text-sm text-muted-foreground">{event.value}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{event.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Fleet Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <h2 className="text-lg font-semibold mb-6">Fleet Metrics Trend (24h)</h2>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={fleetTrend}>
              <defs>
                <linearGradient id="batteryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#252D38" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF" 
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A2028',
                  border: '1px solid #252D38',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="battery"
                stroke="#00E5FF"
                strokeWidth={3}
                dot={{ fill: '#00E5FF', r: 4 }}
                name="Battery %"
                fillOpacity={1}
                fill="url(#batteryGradient)"
              />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 4 }}
                name="Temperature °C"
                fillOpacity={1}
                fill="url(#tempGradient)"
              />
              <Line
                type="monotone"
                dataKey="health"
                stroke="#6C63FF"
                strokeWidth={3}
                dot={{ fill: '#6C63FF', r: 4 }}
                name="Health Score"
                fillOpacity={1}
                fill="url(#healthGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}