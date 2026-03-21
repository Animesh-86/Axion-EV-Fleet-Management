import { motion } from 'motion/react';
import { BarChart3, Activity, Zap, Network, CheckCircle2, Car } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const throughputData = [
  { time: '0s', events: 45 },
  { time: '10s', events: 78 },
  { time: '20s', events: 95 },
  { time: '30s', events: 112 },
  { time: '40s', events: 120 },
  { time: '50s', events: 118 },
  { time: '60s', events: 115 },
];

const latencyData = [
  { percentile: 'P50', ms: 12 },
  { percentile: 'P75', ms: 24 },
  { percentile: 'P90', ms: 35 },
  { percentile: 'P95', ms: 39 },
  { percentile: 'P99', ms: 42 },
];

export function LoadTest() {
  // Generate vehicles on 4 lanes, avoiding the center area
  const lanes = 4;
  
  // Create vehicles distributed across lanes, but skip center positions
  const vehicles: Array<{
    id: string;
    lane: number;
    position: number;
    speed: number;
    delay: number;
    batteryLevel: number;
  }> = [];

  let vehicleCounter = 0;
  
  for (let laneIndex = 0; laneIndex < lanes; laneIndex++) {
    // Left side vehicles (10% to 35%)
    for (let i = 0; i < 4; i++) {
      vehicles.push({
        id: `lane-${laneIndex}-left-${i}`,
        lane: laneIndex,
        position: 10 + (i * 7),
        speed: 0.5 + Math.random() * 0.5,
        delay: vehicleCounter * 0.05,
        batteryLevel: 70 + Math.floor(Math.random() * 30),
      });
      vehicleCounter++;
    }
    
    // Right side vehicles (65% to 90%)
    for (let i = 0; i < 4; i++) {
      vehicles.push({
        id: `lane-${laneIndex}-right-${i}`,
        lane: laneIndex,
        position: 65 + (i * 7),
        speed: 0.5 + Math.random() * 0.5,
        delay: vehicleCounter * 0.05,
        batteryLevel: 70 + Math.floor(Math.random() * 30),
      });
      vehicleCounter++;
    }
  }

  return (
    <section className="relative py-32 bg-[var(--axion-obsidian)] px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,var(--axion-cyan),transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-[var(--font-outfit)] font-black text-white mb-4">
            Stress-Tested for{' '}
            <span className="text-[var(--axion-cyan)]">Fleet Reality</span>
          </h2>
          <p className="text-xl text-gray-400 font-[var(--font-outfit)] max-w-3xl mx-auto">
            Our architecture isn't theoretical. Axion has been load-tested against chaotic network dropouts, 
            battery drain simulations, and massive simultaneous IoT telemetry bursts.
          </p>
        </motion.div>

        {/* Highway Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16 p-8 rounded-2xl bg-gradient-to-br from-[var(--axion-glass-bg)] to-transparent backdrop-blur-md border border-[var(--axion-cyan)]/30 shadow-[0_0_80px_rgba(0,229,255,0.2)]"
        >
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-2xl font-[var(--font-outfit)] font-bold text-white">
              Live Fleet Highway - Real-Time Telemetry
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-[var(--axion-cyan)]" />
                <span className="text-sm text-gray-400 font-[var(--font-jetbrains)]">
                  {vehicles.length} Vehicles Active
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-400">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-green-400 font-[var(--font-jetbrains)]">
                  STREAMING
                </span>
              </div>
            </div>
          </div>

          {/* Highway lanes visualization */}
          <div className="relative h-96 rounded-lg bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border border-[var(--axion-glass-border)] overflow-hidden mb-8">
            {/* Road surface texture */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
            }} />

            {/* Road lanes */}
            <div className="absolute inset-0 flex flex-col justify-around py-4">
              {Array.from({ length: lanes }).map((_, laneIndex) => (
                <div key={laneIndex} className="relative flex-1 border-b border-dashed border-gray-600/50 last:border-b-0">
                  {/* Lane markers */}
                  <div className="absolute inset-0 flex items-center">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div 
                        key={i}
                        className="h-0.5 bg-gray-500/40"
                        style={{
                          width: '5%',
                          marginLeft: i === 0 ? '0%' : '3.33%',
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Vehicles on lanes */}
            {vehicles.map((vehicle) => {
              const laneHeight = 100 / lanes;
              const vehicleY = laneHeight * vehicle.lane + laneHeight / 2;
              
              // Calculate if vehicle is on left or right side
              const isLeftSide = vehicle.position < 50;

              return (
                <motion.div
                  key={vehicle.id}
                  initial={{ x: '-10%', opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: vehicle.delay }}
                  className="absolute group"
                  style={{
                    left: `${vehicle.position}%`,
                    top: `${vehicleY}%`,
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                  }}
                >
                  {/* Connection line to center server */}
                  <svg 
                    className="absolute pointer-events-none" 
                    style={{ 
                      width: '200px', 
                      height: '200px',
                      left: isLeftSide ? '0' : '-150px',
                      top: '-100px',
                      zIndex: 1,
                      overflow: 'visible',
                    }}
                  >
                    <motion.line
                      x1="20"
                      y1="100"
                      x2={isLeftSide ? "150" : "50"}
                      y2="100"
                      stroke="var(--axion-cyan)"
                      strokeWidth="1"
                      strokeOpacity="0.15"
                      strokeDasharray="4 4"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: vehicle.delay + 0.3, duration: 0.8 }}
                    />
                  </svg>

                  {/* Vehicle */}
                  <motion.div
                    className="relative"
                    animate={{
                      x: [0, 5, 0],
                    }}
                    transition={{
                      duration: 2 / vehicle.speed,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {/* Glow effect */}
                    <div className="absolute -inset-2 bg-[var(--axion-cyan)]/30 rounded-full blur-md" />
                    
                    {/* Car icon */}
                    <div className="relative bg-gradient-to-r from-[var(--axion-cyan)] to-blue-500 p-2 rounded-lg shadow-[0_0_20px_rgba(0,229,255,0.6)]">
                      <Car className="w-6 h-6 text-white" />
                      
                      {/* Battery indicator */}
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border border-white shadow-[0_0_6px_rgba(0,255,136,0.8)]" />
                    </div>

                    {/* Data pulse from vehicle to center */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-[var(--axion-cyan)]"
                      animate={{
                        x: isLeftSide ? [0, 50, 100] : [0, -50, -100],
                        y: [0, 0, 0],
                        opacity: [1, 0.5, 0],
                        scale: [1, 0.5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: vehicle.delay,
                        ease: "easeOut"
                      }}
                    />
                  </motion.div>

                  {/* Hover info */}
                  <div className="absolute left-1/2 -translate-x-1/2 -top-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                    <div className="px-3 py-2 rounded-lg bg-black/95 border border-[var(--axion-cyan)] backdrop-blur-sm shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                      <div className="text-xs font-[var(--font-jetbrains)] text-[var(--axion-cyan)] font-bold">
                        Vehicle {vehicle.id}
                      </div>
                      <div className="text-xs font-[var(--font-jetbrains)] text-gray-400">
                        Battery: {vehicle.batteryLevel}%
                      </div>
                      <div className="text-xs font-[var(--font-jetbrains)] text-green-400">
                        ✓ Telemetry Active
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Central Server Tower - Above vehicles */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2" style={{ zIndex: 20 }}>
              {/* Broadcast ripples - centered on server */}
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={`ripple-${i}`}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-[var(--axion-cyan)]/30 rounded-full"
                  style={{ 
                    width: 100, 
                    height: 100,
                  }}
                  animate={{ 
                    scale: [1, 3.5], 
                    opacity: [0.5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.75,
                    ease: "easeOut"
                  }}
                />
              ))}

              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="relative"
              >
                {/* Server tower */}
                <div className="w-28 h-40 rounded-2xl bg-gradient-to-b from-[var(--axion-cyan)] to-blue-600 shadow-[0_0_80px_rgba(0,229,255,0.9)] border-2 border-[var(--axion-cyan)]/50 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                  {/* Animated scan lines */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent"
                    animate={{
                      y: [-100, 200],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  
                  <Network className="w-14 h-14 text-black relative z-10" />
                  <div className="text-base font-[var(--font-jetbrains)] font-bold text-black relative z-10">AXION</div>
                  
                  {/* Signal indicator lights */}
                  <div className="flex gap-1.5 relative z-10">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-green-400"
                        animate={{
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Road edge markers */}
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-r from-yellow-500/40 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-t from-gray-700/40 to-transparent" />
          </div>

          {/* Grafana-style Dashboard */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Throughput Chart */}
            <div className="p-6 rounded-lg bg-black/30 border border-[var(--axion-glass-border)]">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-[var(--axion-cyan)]" />
                <h4 className="text-lg font-[var(--font-outfit)] font-semibold text-white">
                  Throughput
                </h4>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={throughputData}>
                  <defs>
                    <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#888"
                    style={{ fontSize: '11px', fontFamily: 'var(--font-jetbrains)' }}
                  />
                  <YAxis 
                    stroke="#888"
                    style={{ fontSize: '11px', fontFamily: 'var(--font-jetbrains)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--axion-black)', 
                      border: '1px solid var(--axion-cyan)',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-jetbrains)',
                      fontSize: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="events" 
                    stroke="#00E5FF" 
                    strokeWidth={2}
                    fill="url(#colorThroughput)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-2 text-center">
                <span className="text-2xl font-[var(--font-outfit)] font-bold text-[var(--axion-cyan)]">
                  120
                </span>
                <span className="text-sm text-gray-400 font-[var(--font-jetbrains)] ml-2">
                  Events/Second (peak)
                </span>
              </div>
            </div>

            {/* Latency Chart */}
            <div className="p-6 rounded-lg bg-black/30 border border-[var(--axion-glass-border)]">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-[var(--axion-cyan)]" />
                <h4 className="text-lg font-[var(--font-outfit)] font-semibold text-white">
                  API Latency
                </h4>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={latencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="percentile" 
                    stroke="#888"
                    style={{ fontSize: '11px', fontFamily: 'var(--font-jetbrains)' }}
                  />
                  <YAxis 
                    stroke="#888"
                    style={{ fontSize: '11px', fontFamily: 'var(--font-jetbrains)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--axion-black)', 
                      border: '1px solid var(--axion-cyan)',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-jetbrains)',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="ms" fill="#00E5FF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 text-center">
                <span className="text-2xl font-[var(--font-outfit)] font-bold text-[var(--axion-cyan)]">
                  42ms
                </span>
                <span className="text-sm text-gray-400 font-[var(--font-jetbrains)] ml-2">
                  P99 Latency
                </span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { icon: Network, label: 'Axion Consumer Lag', value: '~0 ms', status: 'optimal' },
              { icon: Activity, label: 'Active Vehicles', value: `${vehicles.length}/${vehicles.length}`, status: 'optimal' },
              { icon: CheckCircle2, label: 'Success Rate', value: '99.98%', status: 'optimal' },
              { icon: BarChart3, label: 'Memory Usage', value: '2.1 GB', status: 'optimal' },
            ].map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30"
              >
                <metric.icon className="w-5 h-5 text-green-400 mb-2" />
                <div className="text-sm text-gray-400 font-[var(--font-jetbrains)] mb-1">
                  {metric.label}
                </div>
                <div className="text-xl font-[var(--font-outfit)] font-bold text-white">
                  {metric.value}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
