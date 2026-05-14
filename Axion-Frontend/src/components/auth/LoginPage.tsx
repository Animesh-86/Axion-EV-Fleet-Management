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
    'w-full bg-input text-foreground pl-11 pr-4 py-3 rounded-xl border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-muted-foreground';

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-secondary/[0.08]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(197,165,104,0.12),transparent_55%)]" />

        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-secondary shadow-lg">
              <Zap className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Axion</h1>
              <p className="text-sm text-muted-foreground">Fleet Command Platform</p>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={() => navigate(paths.landing)}
            whileHover={{ scale: 1.02, x: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors mb-12 self-start bg-primary/5 px-4 py-2 rounded-xl border border-primary/15 backdrop-blur-sm"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="font-medium text-sm">Back to Landing</span>
          </motion.button>

          <h2 className="text-4xl font-bold text-foreground mb-4 leading-tight tracking-tight">
            Vendor-Neutral EV Fleet<br />Digital Twin & OTA Orchestration
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
            Monitor, analyze, and manage your entire electric vehicle fleet from a single unified platform.
          </p>

          <div className="h-96">
            <ThreeDartwork />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-secondary shadow-lg">
                <Zap className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Axion</h1>
                <p className="text-sm text-muted-foreground">Fleet Command Platform</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to access your fleet dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
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
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border bg-input" />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors">
                Forgot password?
              </a>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-primary/85 hover:brightness-105 shadow-lg"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => navigate(paths.signup)}
                className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
