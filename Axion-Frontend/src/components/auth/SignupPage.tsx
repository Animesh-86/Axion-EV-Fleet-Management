import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../services/auth';
import { Zap, Mail, Lock, User, Building2, ArrowRight } from 'lucide-react';
import { ThreeDartwork } from './ThreeDartwork';
import { paths } from '../../constants/navigation';

export function SignupPage() {
  const navigate = useNavigate();
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
    else navigate(paths.dashboard);
  };

  const inputClass =
    'w-full bg-white/5 text-foreground pl-11 pr-4 py-3 rounded-lg border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-muted-foreground/30 font-bold text-sm';

  return (
    <div className="min-h-screen flex bg-[#060709]">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#10B98108,transparent_50%)]" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-10 h-10 rounded border border-primary/40 flex items-center justify-center bg-primary/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-precision tracking-tighter uppercase">Axion_Command</h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40">Network_Provisioning_Open</p>
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
            Initialize_Fleet<br />Architecture
          </h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-40 mb-12 max-w-sm leading-relaxed">
            Register your administrative node to begin fleet-wide orchestration and ingestion.
          </p>

          <div className="h-64 opacity-60">
            <ThreeDartwork />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <motion.div
          className="w-full max-w-md py-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-12">
            <h2 className="text-2xl font-black text-precision uppercase tracking-tighter mb-2">Node_Registration</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40 italic">Allocate new security credentials for fleet access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-2">Subject_Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                  placeholder="OPERATOR_NAME"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-2">Network_Identity (Email)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputClass}
                  placeholder="IDENTITY@AXION.SYS"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-2">Organization_Node</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className={inputClass}
                  placeholder="FLEET_GROUP_ID"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-2">Cipher</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={inputClass}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-2">Confirm</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={inputClass}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" className="mt-0.5 w-3.5 h-3.5 rounded-sm border-white/10 bg-white/5 text-primary focus:ring-offset-0 focus:ring-0" required />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity leading-relaxed">
                  Confirm adherence to Axion_Protocol and Data_Ingestion_SLA
                </span>
              </label>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-20 mt-4"
              whileHover={{ scale: 1.01 }}
            >
              {loading ? 'ALLOCATING_NODE...' : 'Commit_Registration'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </form>

          <div className="mt-12 text-center border-t border-white/5 pt-8">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">
              Identity exists?{' '}
              <button
                type="button"
                onClick={() => navigate(paths.login)}
                className="text-primary hover:underline font-black opacity-100 ml-2"
              >
                Access_Gateway
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
