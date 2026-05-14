import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../services/auth';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import { ThreeDartwork } from './ThreeDartwork';
import { paths } from '../../constants/navigation';

export function LoginPage() {
  const navigate = useNavigate();
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
    else navigate(paths.dashboard);
  };

  const inputClass =
    'w-full bg-white/5 text-foreground pl-11 pr-4 py-3 rounded-lg border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-muted-foreground/30 font-bold text-sm';

  return (
    <div className="min-h-screen flex bg-[#060709]">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#10B98108,transparent_50%)]" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-10 h-10 rounded border border-primary/40 flex items-center justify-center bg-primary/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-precision tracking-tighter uppercase">Axion_Command</h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40">Security_Protocol_Active</p>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={() => navigate(paths.landing)}
            whileHover={{ scale: 1.02, x: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-all mb-16 self-start bg-white/5 px-4 py-2 rounded border border-white/10 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest"
          >
            <ArrowRight className="w-3 h-3 rotate-180" />
            <span>Return_To_Base</span>
          </motion.button>

          <h2 className="text-5xl font-black text-precision uppercase leading-[0.9] tracking-tighter mb-6">
            Universal_Fleet<br />Synchronization
          </h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-40 mb-12 max-w-sm leading-relaxed">
            Multi-Vendor Digital Twin Layer & OTA Ingestion Pipeline
          </p>

          <div className="h-64 opacity-60">
            <ThreeDartwork />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-12">
            <h2 className="text-2xl font-black text-precision uppercase tracking-tighter mb-2">Access_Gateway</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40 italic">Initialize session for fleet orchestration</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 py-3 rounded border border-red-500/20 bg-red-500/5 text-red-400 text-[10px] font-black uppercase tracking-widest"
              >
                FAULT: {error}
              </motion.div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-2">Network_Identity (Email)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="IDENTITY@AXION.SYS"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-2">Security_Cipher (Password)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-3.5 h-3.5 rounded-sm border-white/10 bg-white/5 text-primary focus:ring-offset-0 focus:ring-0" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Persist_Session</span>
              </label>
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
                Recover_Cipher
              </a>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-20"
              whileHover={{ scale: 1.01 }}
            >
              {loading ? 'SYNCHRONIZING...' : 'Establish_Link'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </form>

          <div className="mt-12 text-center border-t border-white/5 pt-8">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">
              Identity unknown?{' '}
              <button
                type="button"
                onClick={() => navigate(paths.signup)}
                className="text-primary hover:underline font-black opacity-100 ml-2"
              >
                Register_New_Node
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
