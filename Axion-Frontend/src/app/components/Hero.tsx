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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black px-4 py-20">
      {/* Precision Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      {/* Atmospheric Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(16,185,129,0.08),transparent_60%)]" />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-3 py-1 rounded border border-primary/20 bg-primary/5 backdrop-blur-xl"
            >
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-primary font-black uppercase tracking-[0.3em]">
                ENTERPRISE_TELEMETRY_PIPELINE
              </span>
            </motion.div>

            <h1 className="text-6xl lg:text-8xl font-black text-precision leading-[0.85] tracking-tighter uppercase">
              The Intelligent<br />
              <span className="text-primary">Nervous_System</span><br />
              for Your EV Fleet
            </h1>

            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest max-w-xl leading-relaxed opacity-60">
              Ingesting <span className="text-primary font-black">5,000+ live telemetry events</span> per minute to power sub-second digital twins and ML-driven OTA orchestration.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <motion.button
                onClick={onViewArchitecture}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 border border-white/10 text-precision text-[11px] font-black uppercase tracking-widest rounded bg-white/5 hover:bg-white/10 transition-all"
              >
                View_Architecture
              </motion.button>

              <motion.button
                onClick={onGetStarted}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-primary text-black text-[11px] font-black uppercase tracking-widest rounded hover:brightness-110 transition-all shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]"
              >
                Access_Gateway
              </motion.button>
            </div>
          </motion.div>

          {/* Right: 3D Car with Data Nodes */}
          <div className="relative h-[500px]">
            <Car3D />
            
            {/* Floating Data Nodes */}
            <DataNode
              label="INGESTION_RATE"
              value="84ms_latency | 5,204_msgs/min"
              color="cyan"
              delay={0.3}
              position={{ x: 10, y: 15 }}
            />
            <DataNode
              label="KAFKA_CLUSTER"
              value="telemetry.normal | 250_partitions"
              color="amber"
              delay={0.5}
              position={{ x: 65, y: 20 }}
            />
            <DataNode
              label="DIGITAL_TWIN"
              value="Redis_SYNCHRONIZED | HEALTH_94"
              color="green"
              delay={0.7}
              position={{ x: 35, y: 75 }}
            />
          </div>
        </div>

        {/* Live Metrics Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'ACTIVE_VEHICLES', value: '250', unit: 'CONNECTED' },
            { label: 'EVENTS_PER_SEC', value: '87', unit: 'PEAK' },
            { label: 'SYSTEM_UPTIME', value: '99.97%', unit: 'SLA_REACH' },
            { label: 'ML_PREDICTIONS', value: '10K+', unit: 'PER_HOUR' },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="glass-card p-6 border-white/5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-3 h-3 text-primary opacity-50" />
                <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-40">
                  {metric.label}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-precision tracking-tighter">
                  {metric.value}
                </span>
                <span className="text-[9px] text-primary font-black uppercase tracking-widest opacity-60">
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