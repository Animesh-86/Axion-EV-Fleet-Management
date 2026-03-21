import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Battery, Thermometer, Gauge, Clock, Activity, WifiOff, Circle, Zap, Info, Shield, CheckCircle, Upload } from 'lucide-react';
import { AxionApi, VehicleDetail as ApiVehicleDetail } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { POLL_VEHICLE_DETAIL, TELEMETRY_HISTORY_WINDOW, DEFAULT_CAMPAIGN_ID, HEALTH } from '../../config';

interface VehicleDetailProps {
  vehicleId: string | null;
  onBack: () => void;
}

interface TelemetryEvent {
  timestamp: string;
  event: string;
  oldValue?: string;
  newValue: string;
  type: 'battery' | 'speed' | 'temperature' | 'location' | 'charge' | 'info';
}

export function VehicleDetail({ vehicleId, onBack }: VehicleDetailProps) {
  const [vehicle, setVehicle] = useState<ApiVehicleDetail | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'outdated'>('synced');
  const [activeTab, setActiveTab] = useState<'live' | 'timeline' | 'policies' | 'ota'>('live');
  const [telemetryHistory, setTelemetryHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!vehicleId) return;

    const fetchVehicle = async () => {
      try {
        setSyncStatus('syncing');
        const data = await AxionApi.getVehicle(vehicleId);
        setVehicle(data);
        setIsOnline(data.online);
        setSyncStatus('synced');

        if (data.telemetry) {
          setTelemetryHistory(prev => {
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            // Skip only if ALL values are null/undefined (not just falsy — 0 is valid)
            if (data.telemetry.speedKmph == null && data.telemetry.batterySocPct == null && data.telemetry.batteryTempC == null) {
              return prev;
            }

            const newPoint = {
              time: timeStr,
              speed: data.telemetry.speedKmph ?? prev[prev.length - 1]?.speed ?? 0,
              battery: data.telemetry.batterySocPct ?? prev[prev.length - 1]?.battery ?? 0,
              temp: data.telemetry.batteryTempC ?? prev[prev.length - 1]?.temp ?? 0,
            };
            return [...prev, newPoint].slice(-TELEMETRY_HISTORY_WINDOW);
          });
        }
      } catch (e) {
        console.error("Failed to fetch vehicle detail", e);
        setSyncStatus('outdated');
      }
    };

    fetchVehicle();
    const interval = setInterval(fetchVehicle, POLL_VEHICLE_DETAIL);
    return () => clearInterval(interval);
  }, [vehicleId]);

  if (!vehicleId) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Info className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">What is a Digital Twin?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  A digital twin is a virtual representation of a physical vehicle that mirrors its real-time state,
                  behavior, and performance. It enables remote monitoring, predictive maintenance, and policy enforcement.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  States Maintained
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-background/50 border border-border/50 rounded-lg">
                    <p className="text-sm font-medium">Battery State</p>
                    <p className="text-xs text-muted-foreground mt-1">SOC, voltage, temperature, health</p>
                  </div>
                  <div className="p-3 bg-background/50 border border-border/50 rounded-lg">
                    <p className="text-sm font-medium">Thermal State</p>
                    <p className="text-xs text-muted-foreground mt-1">Cabin, battery, motor temperature</p>
                  </div>
                  <div className="p-3 bg-background/50 border border-border/50 rounded-lg">
                    <p className="text-sm font-medium">Motion State</p>
                    <p className="text-xs text-muted-foreground mt-1">Speed, acceleration, location</p>
                  </div>
                  <div className="p-3 bg-background/50 border border-border/50 rounded-lg">
                    <p className="text-sm font-medium">Operational State</p>
                    <p className="text-xs text-muted-foreground mt-1">Driving, charging, idle, fault</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet-400" />
                  Policy Enforcement
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>OTA eligibility based on battery, connectivity, and fault state</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>Thermal protection triggers when temperature exceeds thresholds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>Predictive maintenance scheduling based on degradation trends</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <span className="text-primary font-semibold">Select a vehicle from the fleet list</span> to view its live digital twin state,
                  telemetry timeline, applied policies, and OTA eligibility status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'battery': return Battery;
      case 'speed': return Gauge;
      case 'temperature': return Thermometer;
      case 'charge': return Zap;
      default: return Circle;
    }
  };

  // Handle telemetry as snapshot (single object)
  const snapshot = vehicle?.telemetry;

  // Create a pseudo-event list for the timeline if needed, or just show latest
  const telemetryEvents: TelemetryEvent[] = snapshot ? [
    { timestamp: new Date().toISOString(), type: 'battery', event: 'SOC Update', newValue: `${snapshot.batterySocPct?.toFixed(1)}%` },
    { timestamp: new Date().toISOString(), type: 'temperature', event: 'Temp Update', newValue: `${snapshot.batteryTempC?.toFixed(1)}°C` }
  ] : [];

  const handleTriggerOta = async () => {
    try {
      if (vehicleId) {
        await AxionApi.triggerOTA(DEFAULT_CAMPAIGN_ID, vehicleId);
        toast.success('OTA Update Triggered', {
          description: `Simulated OTA update initiated for ${vehicleId}`,
        });
      }
    } catch (e) {
      toast.error('OTA Trigger Failed', {
        description: 'Could not reach backend or vehicle not found.',
      });
    }
  };

  return (
    <div className="p-8">
      {/* ... keeping the rest ... */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-3 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Back to Fleet</span>
            </button>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold tracking-tight">{vehicleId}</h1>
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md border border-primary/20 uppercase tracking-wider">
                Digital Twin
              </span>
            </div>
          </div>

          {/* Status Indicator */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isOnline ? 'online' : 'offline'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                }`}
            >
              {isOnline ? (
                <>
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-semibold">ONLINE</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm font-semibold">OFFLINE</span>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Vehicle Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-lg p-6 space-y-6"
          >
            {/* Vehicle Silhouette */}
            <div className="relative h-64 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-primary/10 overflow-hidden">
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/5 to-[#6C63FF]/5" />

              <motion.div
                animate={{
                  opacity: isOnline ? 1 : 0.3,
                  filter: isOnline ? 'none' : 'grayscale(100%)',
                }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {/* Modern EV SVG */}
                <svg width="300" height="180" viewBox="0 0 300 180" fill="none">
                  <defs>
                    <linearGradient id="dtCarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={isOnline ? '#00E5FF' : '#4B5563'} stopOpacity="0.8" />
                      <stop offset="100%" stopColor={isOnline ? '#6C63FF' : '#374151'} stopOpacity="0.8" />
                    </linearGradient>
                    <filter id="dtGlow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <path
                    d="M 50 120 L 70 100 L 100 90 L 130 85 L 170 85 L 200 90 L 230 100 L 250 120 L 250 140 L 230 145 L 70 145 L 50 140 Z"
                    fill="url(#dtCarGradient)"
                    filter="url(#dtGlow)"
                    opacity="0.9"
                  />
                  <path d="M 120 85 L 140 70 L 160 70 L 180 85 Z" fill={isOnline ? '#00E5FF' : '#4B5563'} opacity="0.3" />
                  <circle cx="90" cy="145" r="18" fill="#121821" stroke={isOnline ? '#00E5FF' : '#4B5563'} strokeWidth="3" />
                  <circle cx="210" cy="145" r="18" fill="#121821" stroke={isOnline ? '#6C63FF' : '#4B5563'} strokeWidth="3" />
                  <circle cx="240" cy="110" r="6" fill={isOnline ? '#00FF85' : '#4B5563'}>
                    {isOnline && <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />}
                  </circle>
                </svg>

                {/* Floating speed badge */}
                {isOnline && (
                  <motion.div
                    className="absolute -top-2 left-1/2 -translate-x-1/2"
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(0, 229, 255, 0.2)', color: '#00E5FF' }}>
                      {vehicle?.telemetry?.speedKmph?.toFixed(0) || 0} km/h
                    </div>
                  </motion.div>
                )}

                {/* Energy particles */}
                {isOnline && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full"
                        style={{
                          background: i % 2 === 0 ? '#00E5FF' : '#6C63FF',
                          left: `${15 + (i * 70) % 85}%`,
                          top: `${20 + (i * 50) % 60}%`,
                          boxShadow: `0 0 8px ${i % 2 === 0 ? '#00E5FF' : '#6C63FF'}`,
                        }}
                        animate={{ y: [-15, 15, -15], opacity: [0.2, 1, 0.2], scale: [0.5, 1.5, 0.5] }}
                        transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Status overlay */}
              <div className="absolute top-4 right-4">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
              </div>
            </div>

            {/* Real-time State Indicators */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-lg p-4 border"
                style={{ backgroundColor: '#0B0F14', borderColor: isOnline ? 'rgba(0, 229, 255, 0.3)' : '#2a3542' }}
              >
                <Gauge className="w-5 h-5 mb-2" style={{ color: '#00E5FF' }} />
                <div className="text-xs text-gray-400 mb-1">Speed</div>
                <motion.div className="text-xl font-bold text-white" key={vehicle?.telemetry?.speedKmph} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  {vehicle?.telemetry?.speedKmph?.toFixed(0) || 0}
                </motion.div>
                <p className="text-xs text-muted-foreground mt-1">km/h</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-lg p-4 border"
                style={{
                  backgroundColor: '#0B0F14',
                  borderColor: isOnline
                    ? (vehicle?.battery ?? 100) > 60 ? 'rgba(0, 255, 133, 0.3)' : (vehicle?.battery ?? 100) > 30 ? 'rgba(255, 184, 0, 0.3)' : 'rgba(255, 61, 113, 0.3)'
                    : '#2a3542',
                }}
              >
                <Battery className="w-5 h-5 mb-2" style={{ color: (vehicle?.battery ?? 100) > 60 ? '#00FF85' : (vehicle?.battery ?? 100) > 30 ? '#FFB800' : '#FF3D71' }} />
                <div className="text-xs text-gray-400 mb-1">Battery</div>
                <motion.div className="text-xl font-bold text-white" key={vehicle?.battery} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  {vehicle?.battery?.toFixed(0) || 0}
                </motion.div>
                <p className="text-xs text-muted-foreground mt-1">%</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-lg p-4 border"
                style={{
                  backgroundColor: '#0B0F14',
                  borderColor: isOnline
                    ? (vehicle?.temperature ?? 0) > 50 ? 'rgba(255, 61, 113, 0.3)' : 'rgba(255, 184, 0, 0.3)'
                    : '#2a3542',
                }}
              >
                <Thermometer className="w-5 h-5 mb-2" style={{ color: (vehicle?.temperature ?? 0) > 50 ? '#FF3D71' : '#FFB800' }} />
                <div className="text-xs text-gray-400 mb-1">Temperature</div>
                <motion.div className="text-xl font-bold text-white" key={vehicle?.temperature} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  {vehicle?.temperature?.toFixed(1) || 0}
                </motion.div>
                <p className="text-xs text-muted-foreground mt-1">°C</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-lg p-4 border"
                style={{ backgroundColor: '#0B0F14', borderColor: isOnline ? 'rgba(108, 99, 255, 0.3)' : '#2a3542' }}
              >
                <Clock className="w-5 h-5 mb-2" style={{ color: '#6C63FF' }} />
                <div className="text-xs text-gray-400 mb-1">Last Update</div>
                <motion.div className="text-sm font-bold text-white">
                  {vehicle?.lastSeen ? new Date(vehicle.lastSeen).toLocaleTimeString() : '--:--'}
                </motion.div>
                <p className="text-xs text-muted-foreground mt-1">Live</p>
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT: Digital Twin State */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Digital Twin State Card */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Digital Twin State</h2>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={syncStatus}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold ${syncStatus === 'synced'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : syncStatus === 'syncing'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${syncStatus === 'synced'
                      ? 'bg-emerald-500'
                      : syncStatus === 'syncing'
                        ? 'bg-cyan-500 animate-pulse'
                        : 'bg-amber-500'
                      }`} />
                    {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Outdated'}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-background/50 rounded-lg border border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Health State</p>
                    <p className="font-semibold text-primary">{vehicle?.healthState || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className="font-semibold">{vehicle?.online ? 'Online' : 'Offline'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-background/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Vehicle ID</span>
                    <span className="text-sm font-semibold">{vehicleId}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-background/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Simulation Profile</span>
                    <span className="text-sm font-semibold">Standard EV Profile</span>
                  </div>
                  <div className="flex justify-between p-3 bg-background/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Health Score</span>
                    <span className="text-sm font-semibold text-emerald-400">{vehicle?.healthScore || 0}/100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleTriggerOta}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-semibold hover:bg-primary/20 transition-all">
                  <Upload className="w-4 h-4" /> Trigger OTA
                </button>
                <button className="px-4 py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg text-sm font-semibold hover:bg-secondary/20 transition-all">
                  View History
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card border border-border rounded-lg overflow-hidden"
        >
          {/* Tab Headers */}
          <div className="flex border-b border-border">
            {[
              { id: 'live' as const, label: 'Live State', icon: Activity },
              { id: 'timeline' as const, label: 'State Timeline', icon: Clock },
              { id: 'policies' as const, label: 'Policies Applied', icon: Shield },
              { id: 'ota' as const, label: 'OTA Eligibility', icon: CheckCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all relative ${activeTab === tab.id
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'live' && (
                <motion.div
                  key="live"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-background/50 border border-border/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Battery SOC</p>
                      <p className="text-2xl font-bold text-emerald-400">{vehicle?.battery?.toFixed(1) || 0}%</p>
                    </div>
                    <div className="p-4 bg-background/50 border border-border/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Temperature</p>
                      <p className="text-2xl font-bold text-amber-400">{vehicle?.temperature?.toFixed(1) || 0}°C</p>
                    </div>
                    <div className="p-4 bg-background/50 border border-border/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Health Score</p>
                      <p className="text-2xl font-bold text-primary">{vehicle?.healthScore || 0}</p>
                    </div>
                  </div>

                  {/* Realtime Telemetry Charts */}
                  <div className="space-y-4 pt-4">
                    <h3 className="font-semibold px-1">Live Telemetry Trends</h3>

                    <div className="grid grid-cols-1 gap-4">
                      {/* Battery Chart */}
                      <div className="h-[200px] w-full p-4 bg-background/50 border border-border/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-4">Battery SOC (%)</p>
                        <ResponsiveContainer width="100%" height={120}>
                          <LineChart data={telemetryHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="time" stroke="#666" fontSize={10} tickMargin={10} />
                            <YAxis domain={[0, 100]} stroke="#666" fontSize={10} width={30} />
                            <RechartsTooltip
                              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                              itemStyle={{ color: '#34d399' }}
                            />
                            <Line type="monotone" dataKey="battery" stroke="#34d399" strokeWidth={2} dot={false} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Temperature & Speed Dual Chart */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-[200px] w-full p-4 bg-background/50 border border-border/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-4">Temperature (°C)</p>
                          <ResponsiveContainer width="100%" height={120}>
                            <LineChart data={telemetryHistory}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                              <XAxis dataKey="time" stroke="#666" fontSize={10} tickMargin={10} />
                              <YAxis domain={['auto', 'auto']} stroke="#666" fontSize={10} width={30} />
                              <RechartsTooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                                itemStyle={{ color: '#fbbf24' }}
                              />
                              <Line type="monotone" dataKey="temp" stroke="#fbbf24" strokeWidth={2} dot={false} isAnimationActive={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="h-[200px] w-full p-4 bg-background/50 border border-border/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-4">Speed (km/h)</p>
                          <ResponsiveContainer width="100%" height={120}>
                            <LineChart data={telemetryHistory}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                              <XAxis dataKey="time" stroke="#666" fontSize={10} tickMargin={10} />
                              <YAxis domain={[0, 'auto']} stroke="#666" fontSize={10} width={30} />
                              <RechartsTooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                                itemStyle={{ color: '#22d3ee' }}
                              />
                              <Line type="monotone" dataKey="speed" stroke="#22d3ee" strokeWidth={2} dot={false} isAnimationActive={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'timeline' && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h3 className="font-semibold mb-4">Telemetry Events Timeline</h3>
                  {telemetryEvents.map((event: TelemetryEvent, index: number) => {
                    const EventIcon = getEventIcon(event.type);
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-background/50 border border-border/50 rounded-lg"
                      >
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <EventIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-xs font-mono text-muted-foreground w-24">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <span className="px-2 py-1 bg-muted/50 text-sm font-medium rounded">{event.event}</span>
                        </div>
                        <div className="text-sm text-primary font-semibold">{event.newValue}</div>
                      </div>
                    )
                  })}
                  {telemetryEvents.length === 0 && <p className="text-muted-foreground">No events recorded.</p>}
                </motion.div>
              )}
              {/* Policies and OTA tabs omitted for brevity but should be kept if needed or mocked */}
              {activeTab === 'policies' && (
                <motion.div
                  key="policies"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h3 className="font-semibold mb-4">Active Policy Rules</h3>
                  {[
                    { rule: `Battery SOC < ${HEALTH.SOC_CRITICAL_PCT}%`, action: `Mark CRITICAL, -${HEALTH.PENALTY_CRITICAL} health`, active: (vehicle?.battery ?? 100) < HEALTH.SOC_CRITICAL_PCT },
                    { rule: `Battery SOC < ${HEALTH.SOC_WARNING_PCT}%`, action: `Mark DEGRADED, -${HEALTH.PENALTY_WARNING} health`, active: (vehicle?.battery ?? 100) < HEALTH.SOC_WARNING_PCT && (vehicle?.battery ?? 100) >= HEALTH.SOC_CRITICAL_PCT },
                    { rule: `Battery Temp > ${HEALTH.TEMP_CRITICAL_C}°C`, action: `Mark CRITICAL, -${HEALTH.PENALTY_CRITICAL} health`, active: (vehicle?.temperature ?? 0) > HEALTH.TEMP_CRITICAL_C },
                    { rule: `Battery Temp > ${HEALTH.TEMP_WARNING_C}°C`, action: `Mark DEGRADED, -${HEALTH.PENALTY_WARNING} health`, active: (vehicle?.temperature ?? 0) > HEALTH.TEMP_WARNING_C && (vehicle?.temperature ?? 0) <= HEALTH.TEMP_CRITICAL_C },
                    { rule: 'Vehicle Offline', action: `Mark CRITICAL, -${HEALTH.PENALTY_CRITICAL} health`, active: !isOnline },
                  ].map((policy, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-lg border ${
                      policy.active
                        ? 'bg-red-500/5 border-red-500/30'
                        : 'bg-background/50 border-border/50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${policy.active ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className="text-sm font-medium">{policy.rule}</span>
                      </div>
                      <span className={`text-xs font-semibold ${policy.active ? 'text-red-400' : 'text-muted-foreground'}`}>
                        {policy.active ? 'TRIGGERED' : 'Passing'} — {policy.action}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
              {activeTab === 'ota' && (
                <motion.div
                  key="ota"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold mb-4">OTA Eligibility Check</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { check: `Battery SOC > ${HEALTH.SOC_WARNING_PCT}%`, pass: (vehicle?.battery ?? 0) > HEALTH.SOC_WARNING_PCT },
                      { check: 'Vehicle Online', pass: isOnline },
                      { check: `Battery Temp < ${HEALTH.TEMP_CRITICAL_C}°C`, pass: (vehicle?.temperature ?? 100) < HEALTH.TEMP_CRITICAL_C },
                      { check: 'Health State not CRITICAL', pass: vehicle?.healthState !== 'CRITICAL' },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${
                        item.pass ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                      }`}>
                        <span className="text-sm">{item.check}</span>
                        <span className={`text-xs font-bold ${item.pass ? 'text-emerald-400' : 'text-red-400'}`}>
                          {item.pass ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className={`p-4 rounded-lg border text-center ${
                    (vehicle?.battery ?? 0) > HEALTH.SOC_WARNING_PCT && isOnline && (vehicle?.temperature ?? 100) < HEALTH.TEMP_CRITICAL_C && vehicle?.healthState !== 'CRITICAL'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <p className={`text-sm font-bold ${
                      (vehicle?.battery ?? 0) > HEALTH.SOC_WARNING_PCT && isOnline && (vehicle?.temperature ?? 100) < HEALTH.TEMP_CRITICAL_C && vehicle?.healthState !== 'CRITICAL'
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}>
                      {(vehicle?.battery ?? 0) > HEALTH.SOC_WARNING_PCT && isOnline && (vehicle?.temperature ?? 100) < HEALTH.TEMP_CRITICAL_C && vehicle?.healthState !== 'CRITICAL'
                        ? 'ELIGIBLE — Vehicle can receive OTA updates'
                        : 'NOT ELIGIBLE — One or more checks failed'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}