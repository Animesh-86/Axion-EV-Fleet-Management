import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Car, Wifi, WifiOff, Heart, TrendingUp, AlertTriangle, Battery, Thermometer } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { AxionApi, FleetSummary, FleetVehicle } from '../../services/api';

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
  const [summary, setSummary] = useState<FleetSummary | null>(null);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);

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
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Derive Health Distribution
  const healthDistribution = [
    { name: 'Healthy', value: summary?.healthy || 0, color: '#10B981' },
    { name: 'Degraded', value: summary?.degraded || 0, color: '#F59E0B' },
    { name: 'Critical', value: summary?.critical || 0, color: '#EF4444' },
  ].filter(d => d.value > 0);

  // Derive Avg Health
  const avgHealth = vehicles.length > 0
    ? Math.round(vehicles.reduce((acc, v) => acc + v.healthScore, 0) / vehicles.length)
    : 0;

  // Derive Action Required logic removed in factor of All Vehicles list

  const kpiCards = [
    {
      title: 'Total Vehicles',
      value: summary?.totalVehicles || 0,
      icon: Car,
      trend: '+0',
      color: 'from-cyan-500/20 to-cyan-500/5',
      iconBg: 'bg-cyan-500/10',
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/20',
    },
    {
      title: 'Online',
      value: summary?.onlineVehicles || 0,
      suffix: `/${summary?.totalVehicles || 0}`,
      icon: Wifi,
      trend: '+0',
      color: 'from-emerald-500/20 to-emerald-500/5',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Offline',
      value: (summary?.totalVehicles || 0) - (summary?.onlineVehicles || 0),
      icon: WifiOff,
      trend: '+0',
      color: 'from-gray-500/20 to-gray-500/5',
      iconBg: 'bg-gray-500/10',
      iconColor: 'text-gray-400',
      borderColor: 'border-gray-500/20',
    },
    {
      title: 'Avg Health Score',
      value: avgHealth,
      suffix: '/100',
      icon: Heart,
      trend: '+0',
      color: 'from-violet-500/20 to-violet-500/5',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-400',
      borderColor: 'border-violet-500/20',
    },
    {
      title: 'Critical Vehicles',
      value: summary?.critical || 0,
      icon: AlertTriangle,
      trend: '+0',
      color: 'from-red-500/20 to-red-500/5',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-400',
      borderColor: 'border-red-500/20',
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
      {/* Live Fleet Status - Showing All Vehicles */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Car className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Live Fleet Status</h2>
            <p className="text-sm text-muted-foreground">Real-time telemetry from all connected vehicles</p>
          </div>
        </div>

        <div className="space-y-3">
          {vehicles.length === 0 && (
            <p className="text-muted-foreground text-sm p-4 text-center border border-dashed rounded-lg">
              No vehicles connected. Start the simulator to see live data.
            </p>
          )}
          {vehicles.map((vehicle, index) => {
            const isCritical = vehicle.healthState === 'CRITICAL';
            const isDegraded = vehicle.healthState === 'DEGRADED';
            const statusColor = isCritical ? 'text-red-400' : isDegraded ? 'text-amber-400' : 'text-emerald-400';
            const borderColor = isCritical ? 'border-red-500/30' : isDegraded ? 'border-amber-500/30' : 'border-border';
            const bgColor = isCritical ? 'bg-red-500/5' : isDegraded ? 'bg-amber-500/5' : 'bg-card';

            return (
              <motion.div
                key={vehicle.vehicleId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${bgColor} border ${borderColor} rounded-lg p-4 hover:border-primary/30 transition-all group`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-semibold text-lg">{vehicle.vehicleId}</span>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Battery className="w-4 h-4" /> {vehicle.battery?.toFixed(1)}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Thermometer className="w-4 h-4" /> {vehicle.temperature?.toFixed(1)}°C
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${statusColor} bg-white/5`}>
                      {vehicle.healthState}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Score: {vehicle.healthScore}
                    </span>
                  </div>
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
            {healthDistribution.length === 0 && <p className="text-muted-foreground text-center text-sm">No data available</p>}
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
          <h2 className="text-lg font-semibold mb-2">Historical Trends</h2>
          <p className="text-muted-foreground text-sm">Long-term analysis pending backend TSDB integration.</p>
        </motion.div>
      </div>
    </div>
  );
}