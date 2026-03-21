import { motion } from 'motion/react';
import { Terminal, Github, Linkedin, Twitter, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TerminalFooterProps {
  onGetStarted: () => void;
}

const services = [
  'axion-zookeeper',
  'axion-kafka',
  'axion-timescaledb',
  'axion-redis',
  'axion-postgres',
  'axion-mosquitto',
  'axion-ml-service',
  'axion-backend',
  'axion-frontend',
  'axion-simulator',
];

export function TerminalFooter({ onGetStarted }: TerminalFooterProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentLine < services.length + 2) {
      const timer = setTimeout(() => {
        setCurrentLine(currentLine + 1);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentLine]);

  useEffect(() => {
    const cursor = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursor);
  }, []);

  return (
    <footer className="relative bg-[var(--axion-black)] px-4 py-20 border-t border-[var(--axion-cyan)]/20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-[var(--font-outfit)] font-black text-white mb-4">
            Deploy the Entire Infrastructure{' '}
            <span className="text-[var(--axion-cyan)]">in One Command</span>
          </h2>
          <p className="text-lg text-gray-400 font-[var(--font-outfit)]">
            Full stack orchestration with Docker Compose
          </p>
        </motion.div>

        {/* Terminal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto mb-16 rounded-xl overflow-hidden border border-[var(--axion-cyan)]/50 shadow-[0_0_80px_rgba(0,229,255,0.3)]"
        >
          {/* Terminal Header */}
          <div className="bg-[var(--axion-obsidian)] border-b border-[var(--axion-cyan)]/30 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <Terminal className="w-4 h-4 text-[var(--axion-cyan)] ml-2" />
              <span className="text-sm font-[var(--font-jetbrains)] text-gray-400">
                terminal
              </span>
            </div>
            <div className="text-xs font-[var(--font-jetbrains)] text-gray-500">
              ~/axion-platform
            </div>
          </div>

          {/* Terminal Content */}
          <div className="bg-black p-8 font-[var(--font-jetbrains)] text-sm h-[600px]">
            {currentLine >= 0 && (
              <div className="mb-4">
                <span className="text-[var(--axion-cyan)]">$</span>
                <span className="text-white ml-2">docker compose up --build -d</span>
              </div>
            )}

            {currentLine >= 1 && (
              <div className="mb-4 text-gray-400">
                [+] Running {Math.min(currentLine - 1, services.length)}/{services.length}
              </div>
            )}

            <div className="space-y-1">
              {services.map((service, i) => {
                if (currentLine <= i + 2) return null;
                return (
                  <motion.div
                    key={service}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-green-400">✔</span>
                    <span className="text-gray-400">Container</span>
                    <span className="text-[var(--axion-cyan)]">{service}</span>
                    <span className="text-green-400">Started</span>
                  </motion.div>
                );
              })}
            </div>

            {currentLine > services.length + 1 && (
              <>
                <div className="my-6 border-t border-gray-800" />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <div className="text-green-400 text-lg font-bold">
                    🚀 SYSTEM ONLINE
                  </div>
                  <div className="text-[var(--axion-cyan)]">
                    → Backend API: http://localhost:8080
                  </div>
                  <div className="text-[var(--axion-cyan)]">
                    → Frontend UI: http://localhost:3000
                  </div>
                  <div className="text-[var(--axion-cyan)]">
                    → ML Service: http://localhost:5000
                  </div>
                  <div className="text-amber-400 mt-4">
                    ⚡ 250 VEHICLE SIMULATOR ENGAGED
                  </div>
                  <div className="text-gray-500 text-xs mt-2">
                    Ingesting telemetry at 87 events/second...
                  </div>
                </motion.div>
              </>
            )}

            {showCursor && (
              <div className="inline-block w-2 h-4 bg-[var(--axion-cyan)] ml-1 mt-2" />
            )}
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          
          <motion.button
            onClick={onGetStarted}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-[var(--axion-cyan)] text-[#0B0E14] font-[var(--font-outfit)] font-bold rounded-lg hover:bg-[var(--axion-cyan)]/90 transition-colors shadow-[0_0_30px_rgba(0,229,255,0.3)] flex items-center gap-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 border-2 border-[var(--axion-cyan)] text-[var(--axion-cyan)] font-[var(--font-outfit)] font-bold rounded-lg backdrop-blur-md hover:bg-[var(--axion-glass-bg)] transition-colors flex items-center gap-2"
          >
            <Github className="w-5 h-5" />
            View on GitHub
          </motion.button>
        </motion.div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-800 pt-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-[var(--font-outfit)] font-bold text-white mb-4">
                Axion Platform
              </h3>
              <p className="text-sm text-gray-400 font-[var(--font-outfit)]">
                Enterprise-grade EV Fleet Telemetry, Digital Twin, and OTA Orchestration Platform
              </p>
            </div>

            

            
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-800">
            <div className="text-sm text-gray-500 font-[var(--font-jetbrains)]">
              © 2026 Axion Platform. All rights reserved.
            </div>
            <div className="flex gap-4">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                null
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}