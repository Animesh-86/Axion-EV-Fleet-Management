import { motion } from 'motion/react';
import { Car3D } from './Car3D';
import { DataNode } from './DataNode';
import { Activity, Zap } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
  onViewArchitecture: () => void;
}

export function Hero({ onGetStarted, onViewArchitecture }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--axion-black)] px-4 py-20">
      {/* Refined grid — neutral lines, no neon */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_85%_55%_at_50%_45%,black,transparent)]" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(197,165,104,0.09),transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(92,122,140,0.06),transparent_45%)]" />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--axion-cyan)] bg-[var(--axion-glass-bg)] backdrop-blur-md"
            >
              <Zap className="w-4 h-4 text-[var(--axion-cyan)]" />
              <span className="text-sm text-[var(--axion-cyan)] font-[var(--font-jetbrains)]">
                ENTERPRISE TELEMETRY PLATFORM
              </span>
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-[var(--font-outfit)] font-black text-white leading-tight">
              The Intelligent{' '}
              <span className="text-[var(--axion-cyan)]">Nervous System</span>{' '}
              for Your EV Fleet
            </h1>

            <p className="text-xl text-gray-400 font-[var(--font-outfit)] max-w-xl">
              Ingesting{' '}
              <span className="text-[var(--axion-cyan)] font-bold">5,000+ live telemetry events</span>{' '}
              per minute to power sub-second digital twins and ML-driven OTA orchestration.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <motion.button
                onClick={onViewArchitecture}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                className="px-8 py-4 border border-[var(--axion-glass-border)] text-foreground font-[var(--font-outfit)] font-semibold rounded-xl backdrop-blur-md bg-[var(--axion-glass-bg)] hover:border-[var(--axion-cyan)]/40 hover:bg-[var(--axion-glass-bg)] transition-colors"
              >
                View Architecture
              </motion.button>

              <motion.button
                onClick={onGetStarted}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                className="px-8 py-4 bg-[var(--axion-cyan)] text-primary-foreground font-[var(--font-outfit)] font-semibold rounded-xl hover:brightness-110 transition-all shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)]"
              >
                Get Started
              </motion.button>
            </div>
          </motion.div>

          {/* Right: 3D Car with Data Nodes */}
          <div className="relative h-[500px]">
            <Car3D />
            
            {/* Floating Data Nodes */}
            <DataNode
              label="Ingestion Rate"
              value="84ms latency | 5,204 msgs/min"
              color="cyan"
              delay={0.3}
              position={{ x: 10, y: 15 }}
            />
            <DataNode
              label="Kafka Topic"
              value="telemetry.normal | 250 partitions"
              color="amber"
              delay={0.5}
              position={{ x: 65, y: 20 }}
            />
            <DataNode
              label="Twin State"
              value="Redis SYNCHRONIZED | Health: 94/100"
              color="green"
              delay={0.7}
              position={{ x: 35, y: 75 }}
            />
          </div>
        </div>

        {/* Live Metrics Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Active Vehicles', value: '250', unit: 'connected' },
            { label: 'Events/Second', value: '87', unit: 'avg' },
            { label: 'System Uptime', value: '99.97%', unit: 'SLA' },
            { label: 'ML Predictions', value: '10K+', unit: '/hour' },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="p-6 rounded-lg bg-[var(--axion-glass-bg)] backdrop-blur-md border border-[var(--axion-glass-border)]"
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-[var(--axion-cyan)]" />
                <span className="text-sm text-gray-400 font-[var(--font-jetbrains)]">
                  {metric.label}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white font-[var(--font-outfit)]">
                  {metric.value}
                </span>
                <span className="text-sm text-[var(--axion-cyan)] font-[var(--font-jetbrains)]">
                  {metric.unit}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}