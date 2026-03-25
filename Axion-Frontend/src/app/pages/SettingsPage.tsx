import { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Bell, Shield, Database, Plug, ChevronRight } from 'lucide-react';
import { PORTS, HEALTH, POLL_DASHBOARD, POLL_SYSTEM_HEALTH, TELEMETRY_HISTORY_WINDOW } from '../../config';

type SettingsTab = 'general' | 'notifications' | 'security' | 'data' | 'integrations';

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'data', label: 'Data & Privacy', icon: Database },
  { id: 'integrations', label: 'API Integrations', icon: Plug },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Settings</h1>
        <p className="text-[var(--text-secondary)]">System configuration and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-64 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-[var(--primary-400)]/10 text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)]'
                }`}
                whileHover={{ x: 2 }}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" style={isActive ? { color: 'var(--primary-400)' } : {}} />
                  <span>{tab.label}</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Connection Settings */}
              <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] p-6">
                <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Connection</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[var(--text-secondary)] block mb-1">Backend API URL</label>
                    <input readOnly value={`http://localhost:${PORTS.BACKEND}`} className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg text-sm font-mono text-[var(--text-primary)]" />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--text-secondary)] block mb-1">MQTT Broker</label>
                    <input readOnly value={`localhost:${PORTS.MQTT}`} className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg text-sm font-mono text-[var(--text-primary)]" />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--text-secondary)] block mb-1">Redis</label>
                    <input readOnly value={`localhost:${PORTS.REDIS}`} className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg text-sm font-mono text-[var(--text-primary)]" />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--text-secondary)] block mb-1">Kafka Bootstrap</label>
                    <input readOnly value={`localhost:${PORTS.KAFKA}`} className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg text-sm font-mono text-[var(--text-primary)]" />
                  </div>
                </div>
              </div>

              {/* Monitoring */}
              <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] p-6">
                <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Monitoring</h2>
                <div className="space-y-2">
                  {[
                    { label: 'Dashboard poll interval', value: `${POLL_DASHBOARD / 1000}s` },
                    { label: 'System health poll interval', value: `${POLL_SYSTEM_HEALTH / 1000}s` },
                    { label: 'Digital Twin TTL', value: `${HEALTH.REDIS_TTL_SECONDS}s` },
                    { label: 'Telemetry history window', value: `${TELEMETRY_HISTORY_WINDOW} points` },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-base)] rounded-lg">
                      <span className="text-sm text-[var(--text-secondary)]">{item.label}</span>
                      <span className="text-sm font-mono text-[var(--primary-400)]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Scoring Rules */}
              <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] p-6">
                <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Health Scoring Rules</h2>
                <div className="space-y-2">
                  {[
                    { rule: `SOC < ${HEALTH.SOC_CRITICAL_PCT}%`, penalty: `-${HEALTH.PENALTY_CRITICAL}`, severity: 'critical' },
                    { rule: `SOC < ${HEALTH.SOC_WARNING_PCT}%`, penalty: `-${HEALTH.PENALTY_WARNING}`, severity: 'warning' },
                    { rule: `Battery Temp > ${HEALTH.TEMP_CRITICAL_C}°C`, penalty: `-${HEALTH.PENALTY_CRITICAL}`, severity: 'critical' },
                    { rule: `Battery Temp > ${HEALTH.TEMP_WARNING_C}°C`, penalty: `-${HEALTH.PENALTY_WARNING}`, severity: 'warning' },
                    { rule: 'Vehicle Offline', penalty: `-${HEALTH.PENALTY_CRITICAL}`, severity: 'critical' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-base)] rounded-lg text-sm">
                      <span className="text-[var(--text-secondary)]">{r.rule}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[var(--error)]">{r.penalty}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.severity === 'critical' ? 'bg-[var(--error-muted)] text-[var(--error)]' : 'bg-[var(--warning-muted)] text-[var(--warning)]'}`}>{r.severity}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-[var(--text-tertiary)]">
                  Base score: {HEALTH.BASE_SCORE} | HEALTHY ≥ 80 | DEGRADED 50–79 | CRITICAL &lt; 50
                </div>
              </div>

              {/* About */}
              <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--primary-400)]/20 p-6">
                <h2 className="text-lg font-medium mb-4 text-[var(--primary-400)]">About Axion</h2>
                <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <p><strong className="text-[var(--text-primary)]">Version:</strong> 2.0.0</p>
                  <p><strong className="text-[var(--text-primary)]">Stack:</strong> React 18 + Spring Boot 3.2 + Kafka + Redis</p>
                  <p><strong className="text-[var(--text-primary)]">Architecture:</strong> Event-driven Digital Twin pipeline</p>
                  <p><strong className="text-[var(--text-primary)]">Protocols:</strong> REST + MQTT dual ingestion</p>
                  <p className="pt-2 text-xs text-[var(--text-tertiary)]">EV Fleet Management Platform — Major Project</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] p-6"
            >
              <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                {['Critical alerts', 'Vehicle offline', 'OTA campaign updates', 'Health score changes', 'Temperature warnings'].map((item) => (
                  <div key={item} className="flex items-center justify-between p-3 bg-[var(--bg-base)] rounded-lg">
                    <span className="text-sm text-[var(--text-secondary)]">{item}</span>
                    <div className="w-10 h-5 bg-[var(--primary-400)] rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] p-6"
            >
              <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Security Settings</h2>
              <p className="text-sm text-[var(--text-secondary)]">Authentication is handled via local session storage. Session management and security policies will be added in the major project phase.</p>
            </motion.div>
          )}

          {activeTab === 'data' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] p-6"
            >
              <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Data & Privacy</h2>
              <p className="text-sm text-[var(--text-secondary)]">Telemetry data is stored in Redis with a TTL of {HEALTH.REDIS_TTL_SECONDS} seconds. All fleet data is processed through the event-driven Kafka pipeline.</p>
            </motion.div>
          )}

          {activeTab === 'integrations' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] p-6"
            >
              <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">API Integrations</h2>
              <div className="space-y-3">
                {[
                  { name: 'REST API', endpoint: `http://localhost:${PORTS.BACKEND}/api/v1`, status: 'active' },
                  { name: 'MQTT Broker', endpoint: `mqtt://localhost:${PORTS.MQTT}`, status: 'active' },
                  { name: 'Kafka', endpoint: `localhost:${PORTS.KAFKA}`, status: 'active' },
                  { name: 'Redis Cache', endpoint: `localhost:${PORTS.REDIS}`, status: 'active' },
                ].map((api) => (
                  <div key={api.name} className="flex items-center justify-between p-4 bg-[var(--bg-base)] rounded-lg border border-[var(--border-default)]">
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">{api.name}</div>
                      <div className="text-xs font-mono text-[var(--text-secondary)] mt-1">{api.endpoint}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-[var(--success-muted)] text-[var(--success)]">{api.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
