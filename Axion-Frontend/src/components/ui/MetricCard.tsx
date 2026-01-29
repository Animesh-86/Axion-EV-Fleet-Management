
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  gradient?: string;
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, gradient }: MetricCardProps) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient || 'from-white/5 to-white/[0.02]'
        } p-6 border border-white/10 backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-sm text-gray-400">{title}</div>
        {Icon && (
          <div className="p-2 rounded-lg bg-white/5">
            <Icon className="w-4 h-4 text-blue-400" />
          </div>
        )}
      </div>
      <div className="text-3xl mb-1">{value}</div>
      {subtitle && (
        <div className={`text-sm ${trend ? trendColors[trend] : 'text-gray-500'}`}>
          {subtitle}
        </div>
      )}
    </motion.div>
  );
}
