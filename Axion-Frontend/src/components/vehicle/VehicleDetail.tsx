import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Battery, Thermometer, Gauge, Clock, Activity, WifiOff, Circle, Zap, Info, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface VehicleDetailProps {
  vehicleId: string | null;
  onBack: () => void;
}

interface TelemetryEvent {
  timestamp: string;
  event: string;
  oldValue?: string;
  newValue: string;
  type: 'battery' | 'speed' | 'temperature' | 'location' | 'charge';
}

const mockTelemetry: TelemetryEvent[] = [
  { timestamp: '2026-01-09 14:32:15', event: 'Battery Update', oldValue: '87%', newValue: '85%', type: 'battery' },
  { timestamp: '2026-01-09 14:30:42', event: 'Speed Change', oldValue: '65 km/h', newValue: '72 km/h', type: 'speed' },
  { timestamp: '2026-01-09 14:28:33', event: 'Temperature Update', oldValue: '22°C', newValue: '23°C', type: 'temperature' },
  { timestamp: '2026-01-09 14:25:10', event: 'Location Update', newValue: 'Lat: 12.9716, Lon: 77.5946', type: 'location' },
  { timestamp: '2026-01-09 14:20:05', event: 'Battery Update', oldValue: '89%', newValue: '87%', type: 'battery' },
  { timestamp: '2026-01-09 14:15:30', event: 'Charge Started', newValue: '45%', type: 'charge' },
];

export function VehicleDetail({ vehicleId, onBack }: VehicleDetailProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'outdated'>('synced');
  const [activeTab, setActiveTab] = useState<'live' | 'timeline' | 'policies' | 'ota'>('live');

  // Simulate sync status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus('syncing');
      setTimeout(() => setSyncStatus('synced'), 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  const getEventIcon = (type: TelemetryEvent['type']) => {
    switch (type) {
      case 'battery': return Battery;
      case 'speed': return Gauge;
      case 'temperature': return Thermometer;
      case 'charge': return Zap;
      default: return Circle;
    }
  };

  return (
    <div className="p-8">
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                isOnline
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
            <div className="relative h-64 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
              <motion.div
                animate={{
                  boxShadow: isOnline
                    ? '0 0 40px rgba(0, 229, 255, 0.3)'
                    : '0 0 20px rgba(156, 163, 175, 0.2)',
                }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                className="relative"
              >
                {/* Simplified car icon */}
                <svg
                  width="200"
                  height="120"
                  viewBox="0 0 200 120"
                  fill="none"
                  className="text-primary/40"
                >
                  <rect x="40" y="50" width="120" height="40" rx="8" stroke="currentColor" strokeWidth="3" />
                  <rect x="50" y="35" width="100" height="30" rx="6" stroke="currentColor" strokeWidth="3" />
                  <circle cx="65" cy="95" r="12" stroke="currentColor" strokeWidth="3" fill="currentColor" />
                  <circle cx="135" cy="95" r="12" stroke="currentColor" strokeWidth="3" fill="currentColor" />
                  <line x1="90" y1="35" x2="90" y2="50" stroke="currentColor" strokeWidth="3" />
                </svg>
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
                className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-lg p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-cyan-500/20 p-2 rounded-lg">
                    <Gauge className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Speed</span>
                </div>
                <p className="text-3xl font-bold text-cyan-400">72</p>
                <p className="text-xs text-muted-foreground mt-1">km/h</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-lg p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-500/20 p-2 rounded-lg">
                    <Battery className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Battery</span>
                </div>
                <p className="text-3xl font-bold text-emerald-400">85</p>
                <p className="text-xs text-muted-foreground mt-1">%</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-lg p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-amber-500/20 p-2 rounded-lg">
                    <Thermometer className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Temperature</span>
                </div>
                <p className="text-3xl font-bold text-amber-400">23</p>
                <p className="text-xs text-muted-foreground mt-1">°C</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-lg p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-violet-500/20 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-violet-400" />
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Last Update</span>
                </div>
                <p className="text-sm font-semibold text-violet-400">14:32:15</p>
                <p className="text-xs text-muted-foreground mt-1">2s ago</p>
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
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold ${
                      syncStatus === 'synced'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : syncStatus === 'syncing'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      syncStatus === 'synced'
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
                    <p className="text-xs text-muted-foreground mb-1">Current State</p>
                    <p className="font-semibold text-primary">Active</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Last Known State</p>
                    <p className="font-semibold">Driving</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-background/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Vendor</span>
                    <span className="text-sm font-semibold">Tesla-like</span>
                  </div>
                  <div className="flex justify-between p-3 bg-background/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Model</span>
                    <span className="text-sm font-semibold">Model S</span>
                  </div>
                  <div className="flex justify-between p-3 bg-background/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Firmware</span>
                    <span className="text-sm font-semibold">v2.4.1</span>
                  </div>
                  <div className="flex justify-between p-3 bg-background/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Health Score</span>
                    <span className="text-sm font-semibold text-emerald-400">95/100</span>
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
                <button className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-semibold hover:bg-primary/20 transition-all">
                  Send Command
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
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all relative ${
                    activeTab === tab.id
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
                  <h3 className="font-semibold mb-4">Current Live State</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-background/50 border border-border/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Battery SOC</p>
                      <p className="text-2xl font-bold text-emerald-400">85%</p>
                    </div>
                    <div className="p-4 bg-background/50 border border-border/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Current Speed</p>
                      <p className="text-2xl font-bold text-cyan-400">72 km/h</p>
                    </div>
                    <div className="p-4 bg-background/50 border border-border/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Temperature</p>
                      <p className="text-2xl font-bold text-amber-400">23°C</p>
                    </div>
                    <div className="p-4 bg-background/50 border border-border/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Operational Mode</p>
                      <p className="text-lg font-semibold text-primary">Driving</p>
                    </div>
                    <div className="p-4 bg-background/50 border border-border/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Connection</p>
                      <p className="text-lg font-semibold text-emerald-400">Online</p>
                    </div>
                    <div className="p-4 bg-background/50 border border-border/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Last Sync</p>
                      <p className="text-lg font-semibold">2s ago</p>
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
                  <h3 className="font-semibold mb-4">State Transition History</h3>
                  {[
                    { time: '14:32:15', from: 'Driving', to: 'Active', reason: 'Speed increase' },
                    { time: '14:15:30', from: 'Charging', to: 'Driving', reason: 'Charge complete (45%)' },
                    { time: '13:45:20', from: 'Idle', to: 'Charging', reason: 'Charge initiated' },
                    { time: '12:30:10', from: 'Driving', to: 'Idle', reason: 'Vehicle parked' },
                  ].map((state, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-background/50 border border-border/50 rounded-lg"
                    >
                      <div className="text-xs font-mono text-muted-foreground w-20">{state.time}</div>
                      <div className="flex items-center gap-2 flex-1">
                        <span className="px-2 py-1 bg-muted/50 text-sm font-medium rounded">{state.from}</span>
                        <span className="text-primary">→</span>
                        <span className="px-2 py-1 bg-primary/10 text-primary text-sm font-medium rounded border border-primary/20">{state.to}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{state.reason}</div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'policies' && (
                <motion.div
                  key="policies"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold mb-4">Active Policies</h3>
                  {[
                    { name: 'OTA Update Policy', status: 'active', description: 'Allow OTA updates when battery > 20% and vehicle is idle' },
                    { name: 'Thermal Protection', status: 'active', description: 'Limit charging when temperature > 35°C' },
                    { name: 'Geofencing Policy', status: 'inactive', description: 'Restrict operation outside designated zones' },
                    { name: 'Predictive Maintenance', status: 'active', description: 'Schedule maintenance based on health score trends' },
                  ].map((policy, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-background/50 border border-border/50 rounded-lg"
                    >
                      <div className={`p-2 rounded-lg ${policy.status === 'active' ? 'bg-emerald-500/20' : 'bg-gray-500/20'}`}>
                        <Shield className={`w-4 h-4 ${policy.status === 'active' ? 'text-emerald-400' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold">{policy.name}</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            policy.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                          }`}>
                            {policy.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{policy.description}</p>
                      </div>
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
                  <h3 className="font-semibold mb-4">OTA Update Eligibility</h3>
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <p className="font-semibold text-emerald-400">Eligible for OTA Updates</p>
                    </div>
                    <p className="text-sm text-muted-foreground">All requirements met for over-the-air firmware updates</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { check: 'Battery Level', status: 'pass', value: '85% (> 20% required)', icon: CheckCircle, color: 'emerald' },
                      { check: 'Network Connectivity', status: 'pass', value: 'Online (4G LTE)', icon: CheckCircle, color: 'emerald' },
                      { check: 'Vehicle State', status: 'warning', value: 'Driving (idle preferred)', icon: AlertTriangle, color: 'amber' },
                      { check: 'Temperature', status: 'pass', value: '23°C (< 35°C limit)', icon: CheckCircle, color: 'emerald' },
                      { check: 'Fault Status', status: 'pass', value: 'No critical faults', icon: CheckCircle, color: 'emerald' },
                    ].map((check, index) => {
                      const Icon = check.icon;
                      return (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-4 bg-${check.color}-500/10 border border-${check.color}-500/20 rounded-lg`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 text-${check.color}-400`} />
                            <div>
                              <p className="font-semibold">{check.check}</p>
                              <p className="text-sm text-muted-foreground">{check.value}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 bg-${check.color}-500/20 text-${check.color}-400 border border-${check.color}-500/20 rounded-md text-xs font-semibold uppercase`}>
                            {check.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Telemetry Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-6">Telemetry Events Timeline</h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {mockTelemetry.map((event, index) => {
              const EventIcon = getEventIcon(event.type);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 p-4 bg-background/50 border border-border/50 rounded-lg hover:border-primary/30 transition-all group"
                >
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <EventIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between mb-1">
                      <p className="font-semibold text-sm">{event.event}</p>
                      <p className="text-xs text-muted-foreground font-mono">{event.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {event.oldValue && (
                        <>
                          <span className="text-muted-foreground">{event.oldValue}</span>
                          <span className="text-primary">→</span>
                        </>
                      )}
                      <span className="text-primary font-semibold">{event.newValue}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}