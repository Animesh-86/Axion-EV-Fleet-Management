import { motion } from 'motion/react';
import { Shield, Lock, FileCheck, Key } from 'lucide-react';

export function RBACSection() {
  const auditLogs = [
    { timestamp: '2026-03-15 14:32:18', user: 'admin@axion.io', action: 'OTA_TRIGGER', target: 'Fleet-A (125 vehicles)', status: 'SUCCESS' },
    { timestamp: '2026-03-15 14:31:05', user: 'engineer@axion.io', action: 'POLICY_UPDATE', target: 'Battery Health Threshold', status: 'SUCCESS' },
    { timestamp: '2026-03-15 14:29:42', user: 'analyst@axion.io', action: 'DATA_EXPORT', target: 'Telemetry Archive Q1-2026', status: 'BLOCKED' },
    { timestamp: '2026-03-15 14:28:15', user: 'admin@axion.io', action: 'USER_ROLE_CHANGE', target: 'engineer@axion.io → Senior Engineer', status: 'SUCCESS' },
  ];

  return (
    <section className="relative py-32 bg-black px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,229,255,0.1),transparent_50%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--axion-cyan)] to-blue-500 flex items-center justify-center shadow-[0_0_50px_rgba(0,229,255,0.5)]">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-[var(--font-outfit)] font-black text-white mb-4">
            Secured & <span className="text-[var(--axion-cyan)]">Auditable</span>
          </h2>
          <p className="text-xl text-gray-400 font-[var(--font-outfit)] max-w-3xl mx-auto">
            Enterprise-grade access control with cryptographic audit trails
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Features */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-xl bg-gradient-to-br from-[var(--axion-glass-bg)] to-transparent backdrop-blur-md border border-[var(--axion-cyan)]/30"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-[var(--axion-cyan)]/20 border border-[var(--axion-cyan)] flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-[var(--axion-cyan)]" />
                </div>
                <div>
                  <h3 className="text-2xl font-[var(--font-outfit)] font-bold text-white mb-2">
                    Spring Security JWT
                  </h3>
                  <p className="text-gray-400 font-[var(--font-outfit)]">
                    Stateless authentication with cryptographically signed tokens and automatic refresh rotation
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="p-8 rounded-xl bg-gradient-to-br from-[var(--axion-glass-bg)] to-transparent backdrop-blur-md border border-[var(--axion-cyan)]/30"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-[var(--axion-cyan)]/20 border border-[var(--axion-cyan)] flex items-center justify-center flex-shrink-0">
                  <Key className="w-6 h-6 text-[var(--axion-cyan)]" />
                </div>
                <div>
                  <h3 className="text-2xl font-[var(--font-outfit)] font-bold text-white mb-2">
                    Role-Based Access Control
                  </h3>
                  <p className="text-gray-400 font-[var(--font-outfit)]">
                    Precise permission granularity across OTA triggers, data exports, and system configuration
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {['Fleet Manager', 'System Engineer', 'Data Analyst', 'Read-Only Observer'].map((role, i) => (
                  <motion.div
                    key={role}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-[var(--axion-glass-border)]"
                  >
                    <div className="w-2 h-2 rounded-full bg-[var(--axion-cyan)]" />
                    <span className="text-sm text-gray-300 font-[var(--font-jetbrains)]">
                      {role}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="p-8 rounded-xl bg-gradient-to-br from-[var(--axion-glass-bg)] to-transparent backdrop-blur-md border border-[var(--axion-cyan)]/30"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[var(--axion-cyan)]/20 border border-[var(--axion-cyan)] flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-6 h-6 text-[var(--axion-cyan)]" />
                </div>
                <div>
                  <h3 className="text-2xl font-[var(--font-outfit)] font-bold text-white mb-2">
                    Immutable Audit Trail
                  </h3>
                  <p className="text-gray-400 font-[var(--font-outfit)]">
                    Every OTA trigger and policy change generates a cryptographic audit record in PostgreSQL
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Terminal Audit Log */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="sticky top-8"
          >
            <div className="rounded-xl overflow-hidden border border-[var(--axion-cyan)]/50 shadow-[0_0_60px_rgba(0,229,255,0.3)]">
              {/* Terminal Header */}
              <div className="bg-[var(--axion-obsidian)] border-b border-[var(--axion-cyan)]/30 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="ml-4 text-sm font-[var(--font-jetbrains)] text-gray-400">
                  audit-log-viewer.sh
                </span>
              </div>

              {/* Terminal Content */}
              <div className="bg-black p-6 font-[var(--font-jetbrains)] text-sm">
                <div className="mb-4">
                  <span className="text-[var(--axion-cyan)]">$</span>
                  <span className="text-white ml-2">tail -f /var/log/axion/audit.log</span>
                </div>

                <div className="space-y-2">
                  {auditLogs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="text-xs leading-relaxed"
                    >
                      <div className="flex flex-wrap gap-2">
                        <span className="text-gray-500">[{log.timestamp}]</span>
                        <span className="text-blue-400">USER={log.user}</span>
                        <span className="text-purple-400">ACTION={log.action}</span>
                      </div>
                      <div className="ml-4 mt-1 flex flex-wrap gap-2">
                        <span className="text-gray-300">TARGET="{log.target}"</span>
                        <span className={log.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}>
                          STATUS={log.status}
                        </span>
                      </div>
                      <div className="ml-4 text-gray-600 text-[10px]">
                        HASH=sha256:{Math.random().toString(36).substring(2, 15)}...
                      </div>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="inline-block w-2 h-4 bg-[var(--axion-cyan)] ml-1"
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-lg bg-[var(--axion-glass-bg)] border border-[var(--axion-glass-border)] backdrop-blur-md">
                <div className="text-2xl font-[var(--font-outfit)] font-bold text-[var(--axion-cyan)] mb-1">
                  247K+
                </div>
                <div className="text-sm text-gray-400 font-[var(--font-jetbrains)]">
                  Audit Records
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[var(--axion-glass-bg)] border border-[var(--axion-glass-border)] backdrop-blur-md">
                <div className="text-2xl font-[var(--font-outfit)] font-bold text-[var(--axion-cyan)] mb-1">
                  100%
                </div>
                <div className="text-sm text-gray-400 font-[var(--font-jetbrains)]">
                  Tamper-Proof
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
