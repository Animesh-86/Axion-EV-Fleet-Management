import { motion } from 'motion/react';
import { Server, Activity } from 'lucide-react';

export function SystemHealth() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 space-y-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <div className="relative bg-card border border-border rounded-full p-8 shadow-2xl">
          <Server className="w-16 h-16 text-primary" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -bottom-2 -right-2 bg-background border border-border p-2 rounded-full"
        >
          <Activity className="w-6 h-6 text-emerald-400" />
        </motion.div>
      </motion.div>

      <div className="max-w-md space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">System Health Monitor</h1>
        <p className="text-muted-foreground text-lg">
          Real-time infrastructure monitoring dashboard is coming in the next release.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-lg w-full mt-8">
        <div className="p-4 bg-card/50 border border-border/50 rounded-lg">
          <h3 className="font-semibold mb-1 text-primary">Planned Integration</h3>
          <p className="text-sm text-muted-foreground">Kafka Lag & Throughput Metrics</p>
        </div>
        <div className="p-4 bg-card/50 border border-border/50 rounded-lg">
          <h3 className="font-semibold mb-1 text-primary">Planned Integration</h3>
          <p className="text-sm text-muted-foreground">Redis Cluster Health Status</p>
        </div>
      </div>
    </div>
  );
}