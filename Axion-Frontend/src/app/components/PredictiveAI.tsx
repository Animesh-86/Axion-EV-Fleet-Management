import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

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
