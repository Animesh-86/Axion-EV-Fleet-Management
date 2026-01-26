import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Play, Pause, RotateCcw, CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react';

interface OTACampaign {
  id: string;
  name: string;
  version: string;
  targetGroup: string;
  rolloutPercentage: number;
  status: 'running' | 'paused' | 'rolled-back' | 'completed';
  progress: number;
  vehiclesTotal: number;
  vehiclesCompleted: number;
  vehiclesFailed: number;
  createdAt: string;
  isCanary: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
  targetFleetHealth?: number;
  pastFailureRate?: number;
}

const mockCampaigns: OTACampaign[] = [
  {
    id: 'OTA-001',
    name: 'Winter Performance Update',
    version: 'v2.5.0',
    targetGroup: 'All Vehicles',
    rolloutPercentage: 100,
    status: 'completed',
    progress: 100,
    vehiclesTotal: 248,
    vehiclesCompleted: 248,
    vehiclesFailed: 0,
    createdAt: '2026-01-05',
    isCanary: false,
    riskLevel: 'low',
    targetFleetHealth: 87,
    pastFailureRate: 0,
  },
  {
    id: 'OTA-002',
    name: 'Battery Optimization Patch',
    version: 'v2.4.2',
    targetGroup: 'Tesla-like Models',
    rolloutPercentage: 10,
    status: 'running',
    progress: 67,
    vehiclesTotal: 156,
    vehiclesCompleted: 10,
    vehiclesFailed: 0,
    createdAt: '2026-01-08',
    isCanary: true,
    riskLevel: 'low',
    targetFleetHealth: 92,
    pastFailureRate: 0,
  },
  {
    id: 'OTA-003',
    name: 'Security Hotfix',
    version: 'v2.4.1-sec',
    targetGroup: 'Tata-like Models',
    rolloutPercentage: 25,
    status: 'rolled-back',
    progress: 15,
    vehiclesTotal: 92,
    vehiclesCompleted: 12,
    vehiclesFailed: 2,
    createdAt: '2026-01-07',
    isCanary: true,
    riskLevel: 'high',
    targetFleetHealth: 68,
    pastFailureRate: 14.3,
  },
  {
    id: 'OTA-004',
    name: 'UI Enhancement',
    version: 'v2.5.1',
    targetGroup: 'All Vehicles',
    rolloutPercentage: 50,
    status: 'paused',
    progress: 38,
    vehiclesTotal: 248,
    vehiclesCompleted: 94,
    vehiclesFailed: 1,
    createdAt: '2026-01-09',
    isCanary: false,
    riskLevel: 'medium',
    targetFleetHealth: 87,
    pastFailureRate: 1.1,
  },
];

export function OTAManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    version: '',
    targetGroup: 'all',
    rolloutPercentage: 10,
  });

  const getStatusConfig = (status: OTACampaign['status']) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          icon: CheckCircle,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          glow: 'shadow-emerald-500/20',
        };
      case 'running':
        return {
          label: 'Running',
          icon: Loader2,
          color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
          glow: 'shadow-cyan-500/20',
          animate: 'animate-spin',
        };
      case 'rolled-back':
        return {
          label: 'Rolled Back',
          icon: XCircle,
          color: 'text-red-400 bg-red-500/10 border-red-500/20',
          glow: 'shadow-red-500/30',
        };
      case 'paused':
        return {
          label: 'Paused',
          icon: AlertCircle,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          glow: 'shadow-amber-500/20',
        };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreateModal(false);
    setFormData({ name: '', version: '', targetGroup: 'all', rolloutPercentage: 10 });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">OTA Campaign Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">Orchestrate over-the-air updates with canary rollouts</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </motion.button>
      </div>

      {/* Campaigns */}
      <div className="space-y-4">
        {mockCampaigns.map((campaign, index) => {
          const statusConfig = getStatusConfig(campaign.status);
          const StatusIcon = statusConfig.icon;
          const canaryTargets = Math.ceil((campaign.rolloutPercentage / 100) * campaign.vehiclesTotal);

          return (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/30 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold">{campaign.name}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${statusConfig.color} ${statusConfig.glow} shadow-lg`}>
                      <StatusIcon className={`w-3 h-3 ${statusConfig.animate || ''}`} />
                      {statusConfig.label}
                    </span>
                    {campaign.isCanary && (
                      <span className="px-2.5 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-md text-xs font-semibold">
                        CANARY
                      </span>
                    )}
                    {campaign.riskLevel && (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                        campaign.riskLevel === 'low'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : campaign.riskLevel === 'medium'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/20 shadow-lg'
                      }`}>
                        {campaign.riskLevel === 'low' && '🟢'}
                        {campaign.riskLevel === 'medium' && '🟡'}
                        {campaign.riskLevel === 'high' && '🔴'}
                        {' '}{campaign.riskLevel.toUpperCase()} RISK
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {campaign.id} • Version {campaign.version} • Created {campaign.createdAt}
                  </p>
                  {campaign.riskLevel && (
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Fleet Health: <span className="font-semibold text-foreground">{campaign.targetFleetHealth}%</span></span>
                      <span>Past Failure Rate: <span className={`font-semibold ${campaign.pastFailureRate === 0 ? 'text-emerald-400' : campaign.pastFailureRate! > 10 ? 'text-red-400' : 'text-amber-400'}`}>{campaign.pastFailureRate}%</span></span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {campaign.status === 'running' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-all"
                      title="Pause"
                    >
                      <Pause className="w-4 h-4" />
                    </motion.button>
                  )}
                  {campaign.status === 'paused' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-all"
                      title="Resume"
                    >
                      <Play className="w-4 h-4" />
                    </motion.button>
                  )}
                  {(campaign.status === 'running' || campaign.status === 'paused') && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"
                      title="Rollback"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Target Group</p>
                  <p className="font-semibold">{campaign.targetGroup}</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Rollout %</p>
                  <p className="font-semibold">{campaign.rolloutPercentage}%</p>
                  <p className="text-xs text-muted-foreground mt-1">{canaryTargets} vehicles</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Completed</p>
                  <p className="font-semibold text-emerald-400">{campaign.vehiclesCompleted}</p>
                  <p className="text-xs text-muted-foreground mt-1">of {campaign.vehiclesTotal}</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Failed</p>
                  <p className={`font-semibold ${campaign.vehiclesFailed > 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                    {campaign.vehiclesFailed}
                  </p>
                </div>
              </div>

              {/* Progress Visualization */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Campaign Progress</span>
                  <span className="font-semibold">{campaign.progress}%</span>
                </div>

                {/* Canary Rollout Visualization */}
                {campaign.isCanary ? (
                  <div className="flex gap-2">
                    {/* First 10% - Canary */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '10%' }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="relative h-3 bg-gradient-to-r from-violet-500 to-violet-400 rounded-l-full overflow-hidden"
                    >
                      <motion.div
                        animate={{ x: ['0%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        style={{ width: '50%' }}
                      />
                    </motion.div>

                    {/* Remaining 90% */}
                    <div className="relative flex-1 h-3 bg-muted/30 rounded-r-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((campaign.progress - 10) * (90 / 90), 100)}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                        className={`h-full ${
                          campaign.status === 'completed'
                            ? 'bg-emerald-500'
                            : campaign.status === 'running'
                            ? 'bg-cyan-500'
                            : campaign.status === 'rolled-back'
                            ? 'bg-red-500'
                            : 'bg-amber-500'
                        }`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative h-3 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${campaign.progress}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className={`h-full ${
                        campaign.status === 'completed'
                          ? 'bg-emerald-500'
                          : campaign.status === 'running'
                          ? 'bg-cyan-500'
                          : campaign.status === 'rolled-back'
                          ? 'bg-red-500'
                          : 'bg-amber-500'
                      }`}
                    >
                      {campaign.status === 'running' && (
                        <motion.div
                          animate={{ x: ['0%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          style={{ width: '30%' }}
                        />
                      )}
                    </motion.div>
                  </div>
                )}

                {campaign.isCanary && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-violet-400 font-semibold">Canary phase (first 10%)</span> → Full rollout
                  </p>
                )}
              </div>

              {/* Rollback indicator */}
              {campaign.status === 'rolled-back' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-red-400" />
                    <p className="text-sm text-red-400 font-semibold">
                      Campaign rolled back due to high failure rate ({campaign.vehiclesFailed} failures)
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Create Campaign Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-lg shadow-2xl max-w-lg w-full p-6"
            >
              <h2 className="text-xl font-bold mb-6">Create OTA Campaign</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Campaign Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="e.g., Winter Performance Update"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Firmware Version</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="e.g., v2.5.0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Target Vehicle Group</label>
                  <select
                    value={formData.targetGroup}
                    onChange={(e) => setFormData({ ...formData, targetGroup: e.target.value })}
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="all">All Vehicles</option>
                    <option value="tesla">Tesla-like Models</option>
                    <option value="tata">Tata-like Models</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Canary Rollout Percentage
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="10"
                      value={formData.rolloutPercentage}
                      onChange={(e) =>
                        setFormData({ ...formData, rolloutPercentage: parseInt(e.target.value) })
                      }
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-primary w-16 text-right">
                      {formData.rolloutPercentage}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Start with 10% for canary testing, then increase gradually
                  </p>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-background transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all font-semibold"
                  >
                    Start Campaign
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}