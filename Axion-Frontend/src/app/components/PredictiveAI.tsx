import { motion, useScroll, useTransform } from 'motion/react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useRef } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const batteryData = [
  { time: '00:00', prediction: 85, actual: 87, confidence: 92 },
  { time: '04:00', prediction: 72, actual: 74, confidence: 89 },
  { time: '08:00', prediction: 58, actual: 56, confidence: 91 },
  { time: '12:00', prediction: 45, actual: 47, confidence: 87 },
  { time: '16:00', prediction: 32, actual: 30, confidence: 85 },
  { time: '20:00', prediction: 18, actual: 19, confidence: 88 },
  { time: '24:00', prediction: 5, actual: 6, confidence: 90 },
];

const otaPhases = [
  { phase: 'Draft', status: 'complete', icon: CheckCircle2, color: 'green' },
  { phase: 'Canary', status: 'failed', icon: XCircle, color: 'red' },
  { phase: 'Rollout', status: 'blocked', icon: AlertTriangle, color: 'amber' },
];

export function PredictiveAI() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [150, -150]);

  return (
    <section ref={ref} className="relative py-32 bg-black px-4 overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-20 right-10 w-96 h-96 bg-[var(--axion-cyan)] rounded-full opacity-10 blur-[100px]"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-[100px]"
      />

      
    </section>
  );
}
