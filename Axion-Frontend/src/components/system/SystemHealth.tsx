import { motion } from 'motion/react';
import { Activity, Database, Zap, Cpu, HardDrive, Network, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MetricCard } from '../ui/MetricCard';
import { StatusBadge } from '../ui/StatusBadge';

const kafkaThroughput = [
  { time: '00:00', messages: 12500 },
  { time: '04:00', messages: 8200 },
  { time: '08:00', messages: 18900 },
  { time: '12:00', messages: 25400 },
  { time: '16:00', messages: 22100 },
  { time: '20:00', messages: 15300 },
  { time: '24:00', messages: 11800 },
];

const dbWriteRate = [
  { time: '00:00', writes: 3200 },
  { time: '04:00', writes: 1800 },
  { time: '08:00', writes: 5100 },
  { time: '12:00', writes: 7800 },
  { time: '16:00', writes: 6400 },
  { time: '20:00', writes: 4200 },
  { time: '24:00', writes: 2900 },
];

const cpuUsage = [
  { time: '00:00', usage: 35 },
  { time: '04:00', usage: 28 },
  { time: '08:00', usage: 52 },
  { time: '12:00', usage: 68 },
  { time: '16:00', usage: 61 },
  { time: '20:00', usage: 45 },
  { time: '24:00', usage: 38 },
];

const microservices = [
  { name: 'Vehicle Telemetry Service', status: 'healthy', uptime: '99.98%', latency: '12ms', instances: 8 },
  { name: 'OTA Management Service', status: 'healthy', uptime: '99.95%', latency: '18ms', instances: 4 },
  { name: 'Alert Processing Service', status: 'degraded', uptime: '98.12%', latency: '45ms', instances: 6 },
  { name: 'Analytics Engine', status: 'healthy', uptime: '99.99%', latency: '8ms', instances: 12 },
  { name: 'Fleet API Gateway', status: 'healthy', uptime: '99.97%', latency: '5ms', instances: 16 },
  { name: 'Battery ML Service', status: 'healthy', uptime: '99.94%', latency: '22ms', instances: 4 },
];

const infrastructureAlerts = [
  { service: 'Alert Processing', severity: 'warning', message: 'Response time increased by 180%', time: '5m ago' },
  { service: 'Database Primary', severity: 'critical', message: 'Connection pool nearing capacity (85%)', time: '12m ago' },
  { service: 'Kafka Broker 3', severity: 'info', message: 'Routine maintenance completed', time: '1h ago' },
];

export function SystemHealth() {
  return (
    <div className="p-8 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">System Health Dashboard</h1>
        <p className="text-gray-500">Backend infrastructure monitoring and diagnostics</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <MetricCard
          title="Kafka Throughput"
          value="18.2K/s"
          subtitle="Messages per second"
          icon={Zap}
          trend="up"
          gradient="from-yellow-500/10 to-yellow-600/5"
        />
        <MetricCard
          title="Active Connections"
          value="4,847"
          subtitle="Netty connections"
          icon={Network}
          trend="up"
          gradient="from-blue-500/10 to-blue-600/5"
        />
        <MetricCard
          title="DB Write Rate"
          value="5.4K/s"
          subtitle="PostgreSQL writes"
          icon={Database}
          trend="neutral"
          gradient="from-green-500/10 to-green-600/5"
        />
        <MetricCard
          title="Avg CPU Usage"
          value="54%"
          subtitle="Across all nodes"
          icon={Cpu}
          trend="up"
          gradient="from-purple-500/10 to-purple-600/5"
        />
        <MetricCard
          title="Memory Usage"
          value="68%"
          subtitle="32GB / 47GB used"
          icon={HardDrive}
          trend="neutral"
          gradient="from-cyan-500/10 to-cyan-600/5"
        />
      </div>

      {/* Infrastructure Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <h2 className="text-lg">Infrastructure Alerts</h2>
          <StatusBadge status="warning" label="2 Active" size="sm" />
        </div>
        <div className="space-y-3">
          {infrastructureAlerts.map((alert, index) => (
            <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-black/20 border border-white/10">
              <div className={`p-2 rounded-lg ${
                alert.severity === 'critical' ? 'bg-red-500/20' :
                alert.severity === 'warning' ? 'bg-yellow-500/20' :
                'bg-blue-500/20'
              }`}>
                <AlertCircle className={`w-4 h-4 ${
                  alert.severity === 'critical' ? 'text-red-400' :
                  alert.severity === 'warning' ? 'text-yellow-400' :
                  'text-blue-400'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{alert.service}</span>
                  <StatusBadge 
                    status={alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'info'} 
                    label={alert.severity} 
                    size="sm" 
                  />
                </div>
                <div className="text-xs text-gray-400">{alert.message}</div>
              </div>
              <div className="text-xs text-gray-500">{alert.time}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Kafka Throughput */}
        <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm text-gray-400">Kafka Message Throughput</h3>
            </div>
            <div className="text-2xl text-yellow-400">18.2K/s</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={kafkaThroughput}>
              <defs>
                <linearGradient id="kafkaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="time" 
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
              <Area 
                type="monotone" 
                dataKey="messages" 
                stroke="#eab308" 
                strokeWidth={2}
                fill="url(#kafkaGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* DB Write Rate */}
        <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-green-400" />
              <h3 className="text-sm text-gray-400">Database Write Rate</h3>
            </div>
            <div className="text-2xl text-green-400">5.4K/s</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dbWriteRate}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="time" 
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
              <Line 
                type="monotone" 
                dataKey="writes" 
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ fill: '#22c55e', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CPU Usage */}
      <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] p-6 border border-white/10 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm text-gray-400">CPU Usage Across Cluster</h3>
          </div>
          <div className="text-2xl text-purple-400">54%</div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={cpuUsage}>
            <defs>
              <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="time" 
              stroke="rgba(255,255,255,0.3)"
              style={{ fontSize: '11px' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.3)"
              style={{ fontSize: '11px' }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Area 
              type="monotone" 
              dataKey="usage" 
              stroke="#a78bfa" 
              strokeWidth={2}
              fill="url(#cpuGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Microservices Status */}
      <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg">Microservices Health</h2>
          </div>
        </div>
        
        <div className="divide-y divide-white/10">
          {microservices.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    service.status === 'healthy' ? 'bg-green-500/20' :
                    service.status === 'degraded' ? 'bg-yellow-500/20' :
                    'bg-red-500/20'
                  }`}>
                    {service.status === 'healthy' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm mb-1">{service.name}</div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Uptime: {service.uptime}</span>
                      <span>•</span>
                      <span>Latency: {service.latency}</span>
                      <span>•</span>
                      <span>{service.instances} instances</span>
                    </div>
                  </div>
                </div>
                <StatusBadge 
                  status={service.status === 'healthy' ? 'success' : service.status === 'degraded' ? 'warning' : 'critical'} 
                  label={service.status} 
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}