import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Home, AlertTriangle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, rgba(248, 113, 113, 0.1) 0%, rgba(248, 113, 113, 0.05) 100%)', border: '1px solid rgba(248, 113, 113, 0.2)' }}
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <AlertTriangle className="w-12 h-12 text-[var(--error)]" />
        </motion.div>
        
        <h1 className="text-5xl font-bold text-[var(--text-primary)] mb-3">404</h1>
        <p className="text-lg text-[var(--text-secondary)] mb-8">
          This route doesn't exist in the fleet system
        </p>
        
        <Link 
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-transform hover:scale-105"
          style={{ background: 'linear-gradient(135deg, var(--primary-400) 0%, var(--secondary-400) 100%)' }}
        >
          <Home className="w-5 h-5" />
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
