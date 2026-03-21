import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../services/auth';
import { Zap, Mail, Lock, User, Building2, ArrowRight } from 'lucide-react';
import { ThreeDartwork } from './ThreeDartwork';

interface SignupPageProps {
  onSwitchToLogin: () => void;
  onBackToLanding: () => void;
}

export function SignupPage({ onSwitchToLogin, onBackToLanding }: SignupPageProps) {
  const { signupAsync } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await signupAsync(formData.name, formData.email, formData.password, formData.company);
    setLoading(false);

    if (!result.success) setError(result.error || 'Signup failed');
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0B0F14' }}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0" style={{ 
          background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.1) 0%, rgba(0, 229, 255, 0.1) 100%)',
        }} />
        
        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #00E5FF 100%)' }}>
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
            Join the Future of<br />Fleet Management
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Start managing your EV fleet with enterprise-grade digital twin technology and OTA orchestration.
          </p>

          <div className="h-96">
            <ThreeDartwork />
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <motion.div 
          className="w-full max-w-md py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #00E5FF 100%)' }}>
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Axion</h1>
                <p className="text-sm text-gray-400">Fleet Command Platform</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create your account</h2>
            <p className="text-gray-400">Get started with your fleet management today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <label className="block text-sm text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#121821] text-white pl-11 pr-4 py-3 rounded-lg border border-[#2a3542] focus:border-[#00E5FF] focus:outline-none transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Work Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#121821] text-white pl-11 pr-4 py-3 rounded-lg border border-[#2a3542] focus:border-[#00E5FF] focus:outline-none transition-colors"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Company / Fleet Name</label>
              <div className="relative">
                <Building2 className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-[#121821] text-white pl-11 pr-4 py-3 rounded-lg border border-[#2a3542] focus:border-[#00E5FF] focus:outline-none transition-colors"
                  placeholder="Acme Fleet Services"
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#121821] text-white pl-11 pr-4 py-3 rounded-lg border border-[#2a3542] focus:border-[#00E5FF] focus:outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full bg-[#121821] text-white pl-11 pr-4 py-3 rounded-lg border border-[#2a3542] focus:border-[#00E5FF] focus:outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="mt-1 rounded border-[#2a3542]" required />
                <span className="text-sm text-gray-400">
                  I agree to the{' '}
                  <a href="#" className="hover:underline" style={{ color: '#00E5FF' }}>Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="hover:underline" style={{ color: '#00E5FF' }}>Privacy Policy</a>
                </span>
              </label>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #00E5FF 100%)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button onClick={onSwitchToLogin} className="hover:underline" style={{ color: '#00E5FF' }}>
                Sign in
              </button>
            </p>
          </div>


        </motion.div>
      </div>
    </div>
  );
}
