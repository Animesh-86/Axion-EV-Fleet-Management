import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../services/auth';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import { ThreeDartwork } from './ThreeDartwork';

interface LoginPageProps {
  onSwitchToSignup: () => void;
  onBackToLanding: () => void;
}

export function LoginPage({ onSwitchToSignup, onBackToLanding }: LoginPageProps) {
  const { loginAsync } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await loginAsync(email, password);
    setLoading(false);

    if (!result.success) setError(result.error || 'Login failed');
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0B0F14' }}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0" style={{ 
          background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.1) 0%, rgba(108, 99, 255, 0.1) 100%)',
        }} />
        
        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00E5FF 0%, #6C63FF 100%)' }}>
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Axion</h1>
              <p className="text-sm text-gray-400">Fleet Command Platform</p>
            </div>
          </div>

          <button 
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-[#00E5FF] hover:text-[#00E5FF]/80 transition-colors mb-12 self-start bg-[#00E5FF]/5 px-4 py-2 rounded-lg border border-[#00E5FF]/20 backdrop-blur-sm"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="font-medium text-sm">Back to Landing</span>
          </button>

          <h2 className="text-4xl font-bold text-white mb-4">
            Vendor-Neutral EV Fleet<br />Digital Twin & OTA Orchestration
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Monitor, analyze, and manage your entire electric vehicle fleet from a single unified platform.
          </p>

          <div className="h-96">
            <ThreeDartwork />
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00E5FF 0%, #6C63FF 100%)' }}>
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Axion</h1>
                <p className="text-sm text-gray-400">Fleet Command Platform</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-gray-400">Sign in to access your fleet dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121821] text-white pl-11 pr-4 py-3 rounded-lg border border-[#2a3542] focus:border-[#00E5FF] focus:outline-none transition-colors"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#121821] text-white pl-11 pr-4 py-3 rounded-lg border border-[#2a3542] focus:border-[#00E5FF] focus:outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-[#2a3542]" />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <a href="#" className="text-sm hover:underline" style={{ color: '#00E5FF' }}>
                Forgot password?
              </a>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #00E5FF 0%, #6C63FF 100%)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button onClick={onSwitchToSignup} className="hover:underline" style={{ color: '#00E5FF' }}>
                Sign up
              </button>
            </p>
          </div>


        </motion.div>
      </div>
    </div>
  );
}
