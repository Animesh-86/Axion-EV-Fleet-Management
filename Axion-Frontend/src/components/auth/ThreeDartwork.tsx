import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function ThreeDartwork() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-1000">
      <div
        className="relative w-full max-w-lg aspect-square"
        style={{
          transform: `rotateX(${mousePosition.y * 0.5}deg) rotateY(${mousePosition.x * 0.5}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Central EV Vehicle Shape */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
            <svg width="300" height="180" viewBox="0 0 300 180" className="relative z-10">
              <defs>
                <linearGradient id="vehicleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#00E5FF', stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: '#6C63FF', stopOpacity: 0.8 }} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M 50 120 L 70 100 L 100 90 L 130 85 L 170 85 L 200 90 L 230 100 L 250 120 L 250 140 L 230 145 L 70 145 L 50 140 Z"
                fill="url(#vehicleGradient)"
                filter="url(#glow)"
                opacity="0.9"
              />
              <path d="M 120 85 L 140 70 L 160 70 L 180 85 Z" fill="#00E5FF" opacity="0.3" />
              <circle cx="90" cy="145" r="18" fill="#121821" stroke="#00E5FF" strokeWidth="3" />
              <circle cx="210" cy="145" r="18" fill="#121821" stroke="#6C63FF" strokeWidth="3" />
              <circle cx="240" cy="110" r="6" fill="#00FF85">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
            </svg>

            {/* Energy field particles */}
            <motion.div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    background: i % 2 === 0 ? '#00E5FF' : '#6C63FF',
                    left: `${20 + (i * 60) % 80}%`,
                    top: `${30 + (i * 40) % 60}%`,
                    boxShadow: `0 0 10px ${i % 2 === 0 ? '#00E5FF' : '#6C63FF'}`,
                  }}
                  animate={{ y: [-20, 20, -20], opacity: [0.2, 1, 0.2], scale: [0.5, 1.5, 0.5] }}
                  transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Orbiting cube 1 */}
        <motion.div
          className="absolute"
          style={{ transformStyle: 'preserve-3d', left: '10%', top: '15%' }}
          animate={{ rotateX: [0, 360], rotateY: [0, 360], y: [-10, 10, -10] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-16 h-16 relative" style={{ transformStyle: 'preserve-3d' }}>
            <div className="absolute inset-0 border-2 rounded-lg" style={{ borderColor: '#00E5FF', backgroundColor: 'rgba(0, 229, 255, 0.1)', transform: 'translateZ(8px)' }} />
            <div className="absolute inset-0 border-2 rounded-lg" style={{ borderColor: '#00E5FF', backgroundColor: 'rgba(0, 229, 255, 0.05)', transform: 'translateZ(-8px)' }} />
          </div>
        </motion.div>

        {/* Orbiting cube 2 */}
        <motion.div
          className="absolute"
          style={{ transformStyle: 'preserve-3d', right: '15%', top: '10%' }}
          animate={{ rotateX: [360, 0], rotateZ: [0, 360], y: [10, -10, 10] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-12 h-12 relative" style={{ transformStyle: 'preserve-3d' }}>
            <div className="absolute inset-0 border-2 rounded-lg" style={{ borderColor: '#6C63FF', backgroundColor: 'rgba(108, 99, 255, 0.1)', transform: 'translateZ(6px)' }} />
            <div className="absolute inset-0 border-2 rounded-lg" style={{ borderColor: '#6C63FF', backgroundColor: 'rgba(108, 99, 255, 0.05)', transform: 'translateZ(-6px)' }} />
          </div>
        </motion.div>

        {/* Hexagon bottom-left */}
        <motion.div
          className="absolute"
          style={{ left: '15%', bottom: '20%' }}
          animate={{ rotateZ: [0, 360], scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60">
            <defs>
              <linearGradient id="hexGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#00E5FF', stopOpacity: 0.6 }} />
                <stop offset="100%" style={{ stopColor: '#00E5FF', stopOpacity: 0.1 }} />
              </linearGradient>
            </defs>
            <polygon points="30,5 50,15 50,35 30,45 10,35 10,15" fill="url(#hexGrad1)" stroke="#00E5FF" strokeWidth="2" />
          </svg>
        </motion.div>

        {/* Hexagon bottom-right */}
        <motion.div
          className="absolute"
          style={{ right: '10%', bottom: '15%' }}
          animate={{ rotateZ: [360, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="50" height="50" viewBox="0 0 50 50">
            <defs>
              <linearGradient id="hexGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#6C63FF', stopOpacity: 0.6 }} />
                <stop offset="100%" style={{ stopColor: '#6C63FF', stopOpacity: 0.1 }} />
              </linearGradient>
            </defs>
            <polygon points="25,4 42,12 42,29 25,37 8,29 8,12" fill="url(#hexGrad2)" stroke="#6C63FF" strokeWidth="2" />
          </svg>
        </motion.div>

        {/* Circular rings */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={{ rotateZ: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <div className="relative w-80 h-80">
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: '#00E5FF', opacity: 0.2 }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-8 rounded-full border-2"
              style={{ borderColor: '#6C63FF', opacity: 0.2 }}
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.2, 0.4] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Lightning bolt */}
        <motion.div
          className="absolute"
          style={{ left: '50%', top: '20%', transform: 'translateX(-50%)' }}
          animate={{ opacity: [0.3, 1, 0.3], y: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
            <path d="M13 2L4 18h7l-2 12 11-18h-7l2-12z" fill="#00E5FF" opacity="0.8" />
          </svg>
        </motion.div>

        {/* Data stream lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`stream-${i}`}
              className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              style={{ width: '200px', left: `${(i * 20) % 100}%`, top: `${20 + i * 15}%` }}
              animate={{ x: [-300, 300], opacity: [0, 1, 0] }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5, ease: 'linear' }}
            />
          ))}
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute left-1/4 top-1/4 w-64 h-64 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(0, 229, 255, 0.2) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute right-1/4 bottom-1/4 w-64 h-64 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(108, 99, 255, 0.2) 0%, transparent 70%)' }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>
    </div>
  );
}
