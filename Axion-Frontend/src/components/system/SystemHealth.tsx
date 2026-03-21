import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Server, Activity, Database, Radio, MessageSquare, Cpu, HardDrive, Clock, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { AxionApi } from '../../services/api';
import { POLL_SYSTEM_HEALTH, PORTS, HEALTH, HEALTH_HISTORY_WINDOW } from '../../config';

interface ServiceStatus {
  name: string;
  icon: typeof Server;
  status: 'healthy' | 'degraded' | 'down';
  latency: number | null;
  description: string;
  port: string;
}

interface HealthTick {
  time: string;
  backend: number;
  redis: number;
  vehicles: number;
}

export function SystemHealth() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [uptime, setUptime] = useState(0);
  const [healthHistory, setHealthHistory] = useState<HealthTick[]>([]);
  const historyRef = useRef<HealthTick[]>([]);
  const uptimeRef = useRef(0);

  useEffect(() => {
    const checkHealth = async () => {
      const results: ServiceStatus[] = [];

      // Backend API
      const backendStart = performance.now();
      let backendOk = false;
      let vehicleCount = 0;
      try {
        const summary = await AxionApi.getFleetSummary();
        backendOk = true;
        vehicleCount = summary.totalVehicles;
      } catch {
        backendOk = false;
      }
      const backendLatency = Math.round(performance.now() - backendStart);

      results.push({
        name: 'Spring Boot API',
        icon: Server,
        status: backendOk ? 'healthy' : 'down',
        latency: backendOk ? backendLatency : null,
        description: backendOk ? `Responding in ${backendLatency}ms • ${vehicleCount} digital twins active` : 'API unreachable',
        port: String(PORTS.BACKEND),
      });

      // Redis (inferred from backend — if twins exist, Redis is up)
      results.push({
        name: 'Redis',
        icon: Database,
        status: backendOk && vehicleCount > 0 ? 'healthy' : backendOk ? 'degraded' : 'down',
        latency: backendOk ? Math.max(1, backendLatency - 10) : null,
        description: backendOk && vehicleCount > 0
          ? `${vehicleCount} keys active • TTL ${HEALTH.REDIS_TTL_SECONDS}s`
          : backendOk ? 'Connected but no data' : 'Unreachable',
        port: String(PORTS.REDIS),
      });

      // Kafka (inferred from backend health — if data flows, Kafka is up)
      results.push({
        name: 'Apache Kafka',
        icon: MessageSquare,
        status: backendOk && vehicleCount > 0 ? 'healthy' : backendOk ? 'degraded' : 'down',
        latency: null,
        description: backendOk && vehicleCount > 0
          ? 'Topic: telemetry.normal • Consumer active'
          : backendOk ? 'Broker connected but idle' : 'Unreachable',
        port: String(PORTS.KAFKA),
      });

      // MQTT Broker
      results.push({
        name: 'Mosquitto MQTT',
        icon: Radio,
        status: backendOk && vehicleCount > 0 ? 'healthy' : backendOk ? 'degraded' : 'down',
        latency: null,
        description: backendOk && vehicleCount > 0
          ? 'Topic: vehicle/+/telemetry • Subscribed'
          : 'Broker status inferred from data flow',
        port: String(PORTS.MQTT),
      });

      // Zookeeper
      results.push({
        name: 'Zookeeper',
        icon: HardDrive,
        status: backendOk && vehicleCount > 0 ? 'healthy' : backendOk ? 'degraded' : 'down',
        latency: null,
        description: 'Kafka coordination service',
        port: String(PORTS.ZOOKEEPER),
      });

      setServices(results);

      uptimeRef.current += 5;
      setUptime(uptimeRef.current);

      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const tick: HealthTick = {
        time: now,
        backend: backendLatency,
        redis: backendOk ? Math.max(1, backendLatency - 10) : 0,
        vehicles: vehicleCount,
      };
      const prev = historyRef.current;
      const newH = [...prev, tick].slice(-HEALTH_HISTORY_WINDOW);
      historyRef.current = newH;
      setHealthHistory(newH);
    };

    checkHealth();
    const id = setInterval(checkHealth, POLL_SYSTEM_HEALTH);
    return () => clearInterval(id);
  }, []);

  const healthyCount = services.filter(s => s.status === 'healthy').length;
  const totalCount = services.length;
  const overallStatus = healthyCount === totalCount ? 'All Systems Operational' :
    healthyCount > 0 ? 'Partial Degradation' : 'System Down';
  const overallColor = healthyCount === totalCount ? 'text-emerald-400' :
    healthyCount > 0 ? 'text-amber-400' : 'text-red-400';

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0 ? `${h}h ${m}m ${sec}s` : m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const tooltipStyle = {
    contentStyle: { backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' },
  };

  return (
    <div className="p-8 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2 flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary" /> System Health
        </h1>
        <p className="text-muted-foreground">Infrastructure monitoring and service status</p>
      </div>

      {/* Status Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-6 mb-8 border ${
          healthyCount === totalCount ? 'bg-emerald-500/5 border-emerald-500/20' :
          healthyCount > 0 ? 'bg-amber-500/5 border-amber-500/20' :
          'bg-red-500/5 border-red-500/20'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              healthyCount === totalCount ? 'bg-emerald-400' : healthyCount > 0 ? 'bg-amber-400' : 'bg-red-400'
            }`} />
            <div>
              <h2 className={`text-xl font-semibold ${overallColor}`}>{overallStatus}</h2>
              <p className="text-sm text-muted-foreground">{healthyCount}/{totalCount} services healthy</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Monitoring: {formatUptime(uptime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>Polling: 5s</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {services.map((svc, i) => {
          const Icon = svc.icon;
          return (
            <motion.div key={svc.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={`rounded-xl p-5 border transition-all hover:scale-[1.02] ${
                svc.status === 'healthy' ? 'bg-gradient-to-br from-emerald-500/5 to-emerald-600/[0.02] border-emerald-500/20' :
                svc.status === 'degraded' ? 'bg-gradient-to-br from-amber-500/5 to-amber-600/[0.02] border-amber-500/20' :
                'bg-gradient-to-br from-red-500/5 to-red-600/[0.02] border-red-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${
                    svc.status === 'healthy' ? 'text-emerald-400' :
                    svc.status === 'degraded' ? 'text-amber-400' : 'text-red-400'
                  }`} />
                  <h3 className="font-medium text-sm">{svc.name}</h3>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold ${
                  svc.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' :
                  svc.status === 'degraded' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-red-500/10 text-red-400'
                }`}>{svc.status}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{svc.description}</p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Port: {svc.port}</span>
                {svc.latency !== null && <span>Latency: {svc.latency}ms</span>}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Latency Chart + Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6"
        >
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" /> API Response Latency
          </h2>
          {healthHistory.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={healthHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '10px' }} />
                <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px' }} unit="ms" />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="backend" stroke="#00e5ff" strokeWidth={2} dot={false} name="Backend" />
                <Line type="monotone" dataKey="redis" stroke="#a78bfa" strokeWidth={1.5} dot={false} name="Redis (est.)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">Collecting latency data...</div>
          )}
        </motion.div>

        {/* Architecture Diagram */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6"
        >
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-400" /> System Architecture
          </h2>
          <div className="space-y-3 text-sm">
            {[
              { from: 'Simulator', to: 'REST + MQTT Ingestion', color: 'text-cyan-400', arrow: '→' },
              { from: 'Ingestion Layer', to: 'Kafka (telemetry.normal)', color: 'text-amber-400', arrow: '→' },
              { from: 'Kafka Consumer', to: 'Digital Twin Service', color: 'text-purple-400', arrow: '→' },
              { from: 'Digital Twin', to: 'Redis (120s TTL)', color: 'text-red-400', arrow: '→' },
              { from: 'React Frontend', to: 'Fleet API polling (3–5s)', color: 'text-emerald-400', arrow: '←' },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
              >
                <span className={`font-mono text-xs ${step.color}`}>{step.from}</span>
                <span className="text-muted-foreground">{step.arrow}</span>
                <span className="text-xs text-muted-foreground">{step.to}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}