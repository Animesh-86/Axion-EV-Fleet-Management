import { motion } from 'motion/react';
import { CloudCog, Sparkles } from 'lucide-react';

export function OTAManagement() {
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
          <CloudCog className="w-16 h-16 text-primary" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1 -right-1 bg-background border border-border p-2 rounded-full"
        >
          <Sparkles className="w-5 h-5 text-amber-400" />
        </motion.div>
      </motion.div>

      <div className="max-w-md space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">OTA Campaign Manager</h1>
        <p className="text-muted-foreground text-lg">
          Over-the-air update orchestration and canary rollout management is coming soon.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-lg w-full mt-8">
        <div className="p-4 bg-card/50 border border-border/50 rounded-lg">
          <h3 className="font-semibold mb-1 text-primary">Planned Feature</h3>
          <p className="text-sm text-muted-foreground">Version Distribution & Rollback</p>
        </div>
        <div className="p-4 bg-card/50 border border-border/50 rounded-lg">
          <h3 className="font-semibold mb-1 text-primary">Planned Feature</h3>
          <p className="text-sm text-muted-foreground">Canary Group Targeting</p>
        </div>
      </div>
    </div>
  );
}