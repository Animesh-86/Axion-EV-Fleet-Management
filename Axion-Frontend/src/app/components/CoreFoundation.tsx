import { motion, useScroll, useTransform } from 'motion/react';
import { Database, Gauge, Lock, Workflow, Zap, Radio, Cpu, Settings, Target } from 'lucide-react';
import { useRef } from 'react';

export function CoreFoundation() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const flowProgress = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const features = [
    {
      icon: Workflow,
      title: 'Dual Protocol Ingestion',
      description: 'Handling 250 concurrent vehicles seamlessly via asynchronous REST and Eclipse Mosquitto MQTT ingestion.',
      metrics: ['REST API', 'MQTT Broker', '250 Vehicles'],
    },
    {
      icon: Database,
      title: 'Authoritative Digital Twins',
      description: 'State caching via Redis, providing sub-second reads and instantaneous 120s TTL expiring for stale data protection.',
      metrics: ['<50ms reads', 'Redis Cache', '120s TTL'],
    },
    {
      icon: Gauge,
      title: 'Algorithmic Health Engine',
      description: 'Executing 10,000+ rule evaluations per hour, continuously calculating 0-100 baseline scores against live SOC and thermal profiles.',
      metrics: ['10K+/hour', 'ML Scoring', '0-100 Scale'],
    },
  ];

  return (
    <section ref={ref} className="relative py-32 bg-[var(--axion-obsidian)] px-4 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,var(--axion-cyan)_49%,var(--axion-cyan)_51%,transparent_52%)] bg-[size:20px_20px]" />
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
            Built for{' '}
            <span className="text-[var(--axion-cyan)]">Unforgiving Scale</span>
          </h2>
          <p className="text-xl text-gray-400 font-[var(--font-outfit)] max-w-3xl mx-auto">
            A distributed architecture engineered to handle massive telemetry streams without compromise
          </p>
        </motion.div>

        {/* Architecture Flow Visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20 relative"
        >
          {/* Vertical Stack Architecture Cards */}
          <div className="grid md:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {[
              { label: 'MQTT/REST', desc: 'Dual Ingestion', Icon: Zap },
              { label: 'Kafka', desc: 'Event Stream', Icon: Radio },
              { label: 'Processing', desc: 'ML Pipeline', Icon: Cpu },
              { label: 'Redis', desc: 'State Cache', Icon: Settings },
              { label: 'Digital Twin', desc: 'Live Mirror', Icon: Target }
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative group"
              >
                {/* Connector Arrow - show on all except last */}
                {i < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-20">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                      className="text-[var(--axion-cyan)] text-2xl"
                    >
                      →
                    </motion.div>
                  </div>
                )}

                <div className="relative p-6 rounded-xl bg-gradient-to-br from-[var(--axion-glass-bg)] to-black/40 backdrop-blur-md border border-[var(--axion-glass-border)] group-hover:border-[var(--axion-cyan)] transition-all duration-300 h-full">
                  {/* Animated glow */}
                  <div className="absolute inset-0 rounded-xl bg-[var(--axion-cyan)] opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-300" />
                  
                  <div className="relative z-10 text-center">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                      <div className="w-14 h-14 rounded-lg bg-[var(--axion-cyan)]/10 border border-[var(--axion-cyan)] flex items-center justify-center group-hover:shadow-[0_0_30px_var(--axion-cyan-glow)] transition-all duration-300 group-hover:scale-110">
                        <item.Icon className="w-7 h-7 text-[var(--axion-cyan)]" />
                      </div>
                    </div>
                    
                    {/* Main Label */}
                    <div className="text-lg font-[var(--font-outfit)] font-bold text-[var(--axion-cyan)] mb-2">
                      {item.label}
                    </div>
                    
                    {/* Description */}
                    <div className="text-xs text-gray-400 font-[var(--font-jetbrains)]">
                      {item.desc}
                    </div>

                    {/* Pulse indicator */}
                    <div className="mt-4 flex justify-center">
                      <div className="w-2 h-2 rounded-full bg-[var(--axion-cyan)] animate-pulse shadow-[0_0_10px_var(--axion-cyan)]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Flow Metrics Below */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-[var(--axion-glass-bg)] border border-[var(--axion-cyan)]/30 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-[var(--font-jetbrains)] text-gray-300">
                  87 events/sec
                </span>
              </div>
              <div className="w-px h-4 bg-gray-600" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-[var(--font-jetbrains)] text-gray-300">
                  &lt;84ms latency
                </span>
              </div>
              <div className="w-px h-4 bg-gray-600" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-[var(--font-jetbrains)] text-[var(--axion-cyan)]">
                  99.99% uptime
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="group relative p-8 rounded-xl bg-gradient-to-br from-[var(--axion-glass-bg)] to-transparent backdrop-blur-md border border-[var(--axion-glass-border)] hover:border-[var(--axion-cyan)] transition-all duration-300"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-xl bg-[var(--axion-cyan)] opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-lg bg-[var(--axion-cyan)]/10 border border-[var(--axion-cyan)] flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_var(--axion-cyan-glow)] transition-shadow">
                  <feature.icon className="w-7 h-7 text-[var(--axion-cyan)]" />
                </div>

                <h3 className="text-2xl font-[var(--font-outfit)] font-bold text-white mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-400 font-[var(--font-outfit)] mb-6 leading-relaxed">
                  {feature.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {feature.metrics.map((metric) => (
                    <span
                      key={metric}
                      className="px-3 py-1 rounded-full bg-[var(--axion-cyan)]/10 border border-[var(--axion-cyan)]/30 text-[var(--axion-cyan)] text-sm font-[var(--font-jetbrains)]"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Performance Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-8 rounded-xl bg-gradient-to-r from-[var(--axion-glass-bg)] to-transparent backdrop-blur-md border border-[var(--axion-glass-border)]"
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-[var(--font-outfit)] font-black text-[var(--axion-cyan)] mb-2">
                250
              </div>
              <div className="text-sm text-gray-400 font-[var(--font-jetbrains)]">
                Kafka Partitions
              </div>
            </div>
            <div>
              <div className="text-4xl font-[var(--font-outfit)] font-black text-[var(--axion-cyan)] mb-2">
                &lt;84ms
              </div>
              <div className="text-sm text-gray-400 font-[var(--font-jetbrains)]">
                Average Latency
              </div>
            </div>
            <div>
              <div className="text-4xl font-[var(--font-outfit)] font-black text-[var(--axion-cyan)] mb-2">
                120s
              </div>
              <div className="text-sm text-gray-400 font-[var(--font-jetbrains)]">
                TTL Auto-Expiry
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}