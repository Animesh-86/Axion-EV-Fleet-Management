import { motion } from 'motion/react';
import { Database, Gauge, Workflow, Zap, Radio, Cpu, Settings, Target } from 'lucide-react';
import { useRef } from 'react';

export function CoreFoundation() {
  const ref = useRef<HTMLDivElement>(null);
  
  const features = [
    {
      icon: Workflow,
      title: 'DUAL_PROTOCOL_INGESTION',
      description: 'Handling 250 concurrent vehicles seamlessly via asynchronous REST and Eclipse Mosquitto MQTT ingestion.',
      metrics: ['REST_GATEWAY', 'MQTT_BROKER', 'ASYNC_LOAD'],
    },
    {
      icon: Database,
      title: 'AUTHORITATIVE_TWINS',
      description: 'State caching via Redis, providing sub-second reads and instantaneous 120s TTL expiring for stale data protection.',
      metrics: ['<50MS_READS', 'REDIS_PERSIST', 'TTL_AUTO'],
    },
    {
      icon: Gauge,
      title: 'ALGORITHMIC_SCORING',
      description: 'Executing 10,000+ rule evaluations per hour, continuously calculating 0-100 baseline scores against live SOC and thermal profiles.',
      metrics: ['10K+/HOUR', 'ML_HEURISTICS', '0-100_RANGE'],
    },
  ];

  return (
    <section ref={ref} className="relative py-32 bg-black px-4 overflow-hidden">
      {/* Background Precision Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,#10B981_49%,#10B981_51%,transparent_52%)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-6xl md:text-7xl font-black text-precision mb-6 tracking-tighter uppercase leading-[0.9]">
            Built for<br />
            <span className="text-primary">Unforgiving_Scale</span>
          </h2>
          <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.4em] max-w-2xl mx-auto opacity-50">
            DISTRIBUTED_ARCHITECTURE • HIGH_THROUGHPUT • FAULT_TOLERANT
          </p>
        </motion.div>

        {/* Architecture Flow Visualization */}
        <div className="mb-32 relative">
          <div className="grid md:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {[
              { label: 'MQTT/REST', desc: 'INGESTION', Icon: Zap },
              { label: 'KAFKA', desc: 'EVENT_STREAM', Icon: Radio },
              { label: 'SCORING', desc: 'ML_PIPELINE', Icon: Cpu },
              { label: 'REDIS', desc: 'STATE_CACHE', Icon: Settings },
              { label: 'TWIN', desc: 'LIVE_MIRROR', Icon: Target }
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="relative group"
              >
                <div className="glass-card p-6 border-white/5 group-hover:border-primary/40 transition-all duration-500 h-full text-center">
                  <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 rounded border border-primary/20 bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <item.Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="text-xs font-black font-mono text-precision mb-1 uppercase tracking-tighter">
                    {item.label}
                  </div>
                  <div className="text-[8px] text-muted-foreground font-black uppercase tracking-widest opacity-40">
                    {item.desc}
                  </div>
                  <div className="mt-6 flex justify-center">
                    <div className="w-1 h-1 rounded-full bg-primary/30 group-hover:bg-primary animate-pulse" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-6 px-6 py-3 rounded border border-white/5 bg-white/[0.02] backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#10B981]" />
                <span className="text-[9px] font-black font-mono text-precision uppercase tracking-widest">87_EVENTS/SEC</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <span className="text-[9px] font-black font-mono text-precision uppercase tracking-widest opacity-60">&lt;84MS_LATENCY</span>
              <div className="w-px h-3 bg-white/10" />
              <span className="text-[9px] font-black font-mono text-primary uppercase tracking-widest">99.99%_UPTIME</span>
            </div>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 border-white/5 hover:border-primary/30 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded border border-primary/20 bg-primary/5 flex items-center justify-center mb-8">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>

              <h3 className="text-xl font-black text-precision mb-4 uppercase tracking-tighter">
                {feature.title}
              </h3>

              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-8 leading-relaxed opacity-60">
                {feature.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {feature.metrics.map((metric) => (
                  <span
                    key={metric}
                    className="px-2 py-1 rounded border border-primary/10 bg-primary/5 text-primary text-[8px] font-black uppercase tracking-widest"
                  >
                    {metric}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Technical Footer Metric */}
        <div className="mt-24 pt-12 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: 'KAFKA_PARTITIONS', value: '250', color: 'text-precision' },
              { label: 'AVG_REPLICATION', value: '3', color: 'text-precision' },
              { label: 'TTL_PURGE_INT', value: '120S', color: 'text-primary' },
              { label: 'THREAD_POOL', value: 'ASYNC', color: 'text-precision' },
            ].map((stat, i) => (
              <div key={i}>
                <div className={`text-2xl font-black tracking-tighter ${stat.color}`}>{stat.value}</div>
                <div className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 mt-1">{stat.label}</div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}