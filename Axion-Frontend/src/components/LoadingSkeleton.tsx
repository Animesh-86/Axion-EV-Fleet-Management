import { motion } from 'motion/react';

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <motion.div
          className="h-8 w-64 rounded-lg"
          style={{ backgroundColor: '#1a2332' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="h-4 w-96 rounded-lg"
          style={{ backgroundColor: '#1a2332' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="h-32 rounded-xl"
            style={{ backgroundColor: '#1a2332' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
}
