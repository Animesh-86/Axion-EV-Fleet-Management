import { motion } from 'motion/react';

interface DataNodeProps {
  label: string;
  value: string;
  color?: 'cyan' | 'amber' | 'red' | 'green';
  delay?: number;
  position: { x: number; y: number };
}

export function DataNode({ label, value, color = 'cyan', delay = 0, position }: DataNodeProps) {
  const colorClasses = {
    cyan: 'border-[var(--axion-cyan)] text-[var(--axion-cyan)] shadow-[0_0_20px_var(--axion-cyan-glow)]',
    amber: 'border-[var(--axion-amber)] text-[var(--axion-amber)] shadow-[0_0_20px_rgba(255,193,7,0.5)]',
    red: 'border-[var(--axion-red)] text-[var(--axion-red)] shadow-[0_0_20px_rgba(255,61,0,0.5)]',
    green: 'border-green-400 text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.5)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -10, 0],
      }}
      transition={{ 
        opacity: { delay, duration: 0.5 },
        scale: { delay, duration: 0.5 },
        y: { 
          delay: delay + 0.5,
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      className={`absolute backdrop-blur-md bg-[var(--axion-glass-bg)] border ${colorClasses[color]} rounded-lg p-3 font-[var(--font-jetbrains)]`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
    >
      <div className="text-xs opacity-80 mb-1">{label}</div>
      <div className="text-sm font-semibold whitespace-nowrap">{value}</div>
    </motion.div>
  );
}
