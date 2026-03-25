import { motion } from 'motion/react';
import { User, Mail, Building2, Shield } from 'lucide-react';
import { useAuth } from '../../services/auth';

export function AccountSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Account Settings</h1>
        <p className="text-[var(--text-secondary)]">Manage your account details and preferences</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] p-6"
      >
        <div className="flex items-start gap-6">
          <div 
            className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--primary-400) 0%, var(--secondary-400) 100%)' }}
          >
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-sm text-[var(--text-secondary)] block mb-1">Full Name</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg">
                <User className="w-4 h-4 text-[var(--text-tertiary)]" />
                <span className="text-sm text-[var(--text-primary)]">{user?.name || 'Fleet Operator'}</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-[var(--text-secondary)] block mb-1">Email Address</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg">
                <Mail className="w-4 h-4 text-[var(--text-tertiary)]" />
                <span className="text-sm text-[var(--text-primary)]">{user?.email || 'operator@axion.io'}</span>
              </div>
            </div>
            {user?.company && (
              <div>
                <label className="text-sm text-[var(--text-secondary)] block mb-1">Company</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg">
                  <Building2 className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span className="text-sm text-[var(--text-primary)]">{user.company}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Session Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-[var(--primary-400)]" />
          <h2 className="text-lg font-medium text-[var(--text-primary)]">Session Information</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[var(--bg-base)] rounded-lg">
            <span className="text-sm text-[var(--text-secondary)]">Auth Method</span>
            <span className="text-sm font-mono text-[var(--primary-400)]">Local Session</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[var(--bg-base)] rounded-lg">
            <span className="text-sm text-[var(--text-secondary)]">Storage</span>
            <span className="text-sm font-mono text-[var(--primary-400)]">localStorage</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[var(--bg-base)] rounded-lg">
            <span className="text-sm text-[var(--text-secondary)]">Status</span>
            <span className="text-xs px-2 py-1 rounded-full bg-[var(--success-muted)] text-[var(--success)]">Active</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
