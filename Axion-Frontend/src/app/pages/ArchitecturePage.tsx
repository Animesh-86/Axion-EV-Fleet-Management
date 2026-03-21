import { motion } from 'motion/react';
import { ArrowLeft, Database, Server, Cpu, Monitor, Zap, Cloud } from 'lucide-react';

interface ArchitecturePageProps {
  onBack: () => void;
}

export function ArchitecturePage({ onBack }: ArchitecturePageProps) {
  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />

      <div className="relative z-10 max-w-[1800px] mx-auto px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[#00E5FF] hover:text-[#00E5FF]/80 transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-[var(--font-jetbrains)] text-sm">Back to Home</span>
          </button>
          
          <h1 className="text-5xl md:text-6xl font-[var(--font-outfit)] font-black text-white mb-4">
            System <span className="text-[#00E5FF]">Architecture</span> Explorer
          </h1>
          <p className="text-xl text-gray-400 font-[var(--font-outfit)] max-w-3xl">
            Enterprise-grade EV Fleet Telemetry Pipeline powered by event-driven architecture
          </p>
        </motion.div>

        {/* Architecture Diagram - Grid Layout */}
        <div className="grid grid-cols-5 gap-8 items-center mb-16">
          {/* Stage 1: Data Source */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-1"
          >
            <div className="relative">
              <div className="w-full p-5 rounded-2xl bg-gradient-to-br from-[#0a0e1a]/80 to-[#030712]/80 backdrop-blur-xl border border-[#3B82F6]/30 shadow-[0_0_40px_rgba(59,130,246,0.2)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#3B82F6] flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.5)]">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-[var(--font-outfit)] font-bold text-white">Data Source</h3>
                    <p className="text-xs text-gray-400 font-[var(--font-jetbrains)]">Vehicle Nodes</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="font-[var(--font-jetbrains)] text-xs">Python Simulator</span>
                  </div>
                  <div className="text-xs text-gray-500 font-[var(--font-jetbrains)]">
                    Emitting telemetry @ 5k events/min
                  </div>
                </div>
                
                {/* Arrow indicator */}
                <motion.div
                  className="absolute -right-4 top-1/2 -translate-y-1/2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="w-8 h-0.5 bg-gradient-to-r from-[#00E5FF] to-transparent" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Stage 2: Ingestion Layer */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="col-span-1"
          >
            <div className="w-full p-5 rounded-2xl bg-gradient-to-br from-[#0a0e1a]/80 to-[#030712]/80 backdrop-blur-xl border border-[#3B82F6]/30 shadow-[0_0_40px_rgba(59,130,246,0.2)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#00E5FF] flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-[var(--font-outfit)] font-bold text-white">Spring Boot</h3>
                  <p className="text-xs text-gray-400 font-[var(--font-jetbrains)]">Gateway</p>
                </div>
              </div>
              
              <div className="flex gap-2 mb-3 flex-wrap">
                <span className="px-2 py-1 rounded-md bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-xs font-[var(--font-jetbrains)] text-[#00E5FF]">
                  REST
                </span>
                <span className="px-2 py-1 rounded-md bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-xs font-[var(--font-jetbrains)] text-[#00E5FF]">
                  MQTT
                </span>
              </div>
              
              <div className="text-xs text-gray-500 font-[var(--font-jetbrains)]">
                Protocol normalization
              </div>
              
              {/* Arrow indicator */}
              <motion.div
                className="absolute -right-4 top-1/2 -translate-y-1/2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              >
                <div className="w-8 h-0.5 bg-gradient-to-r from-[#3B82F6] to-transparent" />
              </motion.div>
            </div>
          </motion.div>

          {/* Stage 3: Kafka Backbone */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="col-span-1"
          >
            <div className="relative">
              <div className="w-full p-6 rounded-2xl bg-gradient-to-br from-[#0a0e1a]/90 to-[#030712]/90 backdrop-blur-xl border-2 border-[#00E5FF]/50 shadow-[0_0_60px_rgba(0,229,255,0.4)]">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#3B82F6] flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.6)] mb-3">
                    <Cloud className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-[var(--font-outfit)] font-black text-white mb-1">Apache Kafka</h3>
                  <p className="text-xs text-gray-400 font-[var(--font-jetbrains)]">Event-Driven Backbone</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs font-[var(--font-jetbrains)]">
                  <div className="p-2 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30">
                    <div className="text-[#00E5FF] font-bold">250</div>
                    <div className="text-gray-400 text-[10px]">Concurrent</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30">
                    <div className="text-[#00E5FF] font-bold">&lt;1ms</div>
                    <div className="text-gray-400 text-[10px]">Latency</div>
                  </div>
                </div>
              </div>
              
              {/* Glow rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-2xl border-2 border-[#00E5FF]/20"
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 1,
                    repeat: Infinity,
                  }}
                />
              ))}
              
              {/* Arrow indicators */}
              <motion.div
                className="absolute -right-4 top-[30%] -translate-y-1/2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
              >
                <div className="w-8 h-0.5 bg-gradient-to-r from-[#00E5FF] to-transparent" />
              </motion.div>
              <motion.div
                className="absolute -right-4 top-[70%] -translate-y-1/2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 1.2 }}
              >
                <div className="w-8 h-0.5 bg-gradient-to-r from-[#00E5FF] to-transparent" />
              </motion.div>
            </div>
          </motion.div>

          {/* Stage 4: Processing (Redis + Health Engine) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4 }}
            className="col-span-1 space-y-6"
          >
            {/* Redis Digital Twin */}
            <div className="w-full p-4 rounded-2xl bg-gradient-to-br from-[#0a0e1a]/80 to-[#030712]/80 backdrop-blur-xl border border-[#22C55E]/30 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#22C55E] to-[#00E5FF] flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-[var(--font-outfit)] font-bold text-white">Redis Digital Twin</h3>
                  <p className="text-xs text-gray-400 font-[var(--font-jetbrains)]">State Management</p>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 font-[var(--font-jetbrains)]">
                Sub-second vehicle state sync
              </div>
            </div>
            
            {/* Health Score Engine */}
            <div className="w-full p-4 rounded-2xl bg-gradient-to-br from-[#0a0e1a]/80 to-[#030712]/80 backdrop-blur-xl border border-[#22C55E]/30 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#22C55E] to-[#00E5FF] flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-[var(--font-outfit)] font-bold text-white">Health Score Engine</h3>
                  <p className="text-xs text-gray-400 font-[var(--font-jetbrains)]">AI Processing</p>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 font-[var(--font-jetbrains)]">
                Predictive analytics & anomaly detection
              </div>
            </div>
            
            {/* Arrow indicator */}
            <motion.div
              className="absolute -right-4 top-1/2 -translate-y-1/2"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1.5 }}
            >
              <div className="w-8 h-0.5 bg-gradient-to-r from-[#22C55E] to-transparent" />
            </motion.div>
          </motion.div>

          {/* Stage 5: Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.8 }}
            className="col-span-1"
          >
            <div className="w-full p-5 rounded-2xl bg-gradient-to-br from-[#0a0e1a]/80 to-[#030712]/80 backdrop-blur-xl border border-[#00E5FF]/30 shadow-[0_0_40px_rgba(0,229,255,0.2)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#3B82F6] flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.5)]">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-[var(--font-outfit)] font-bold text-white">React/Vite</h3>
                  <p className="text-xs text-gray-400 font-[var(--font-jetbrains)]">Dashboard</p>
                </div>
              </div>
              
              {/* Mini chart visualization */}
              <div className="h-16 rounded-lg bg-[#030712]/50 border border-[#00E5FF]/20 p-2 flex items-end gap-1">
                {[40, 60, 45, 70, 55, 80, 65, 90].map((height, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-sm bg-gradient-to-t from-[#00E5FF] to-[#3B82F6]"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 2 + i * 0.1 }}
                  />
                ))}
              </div>
              
              <div className="mt-3 text-xs text-gray-500 font-[var(--font-jetbrains)]">
                Real-time fleet visualization
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
