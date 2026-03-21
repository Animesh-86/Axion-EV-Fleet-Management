import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CloudCog, Rocket, CheckCircle2, XCircle, Clock, Shield, Battery, Thermometer, Wifi, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { AxionApi, FleetVehicle } from '../../services/api';
import { POLL_OTA, DEFAULT_CAMPAIGN_ID, HEALTH } from '../../config';

interface OtaLog {
  id: number;
  vehicleId: string;
  campaignId: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
}

let logCounter = 0;

export function OTAManagement() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [otaLogs, setOtaLogs] = useState<OtaLog[]>([]);
  const [selectedCampaign] = useState(DEFAULT_CAMPAIGN_ID);
  const [triggering, setTriggering] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const v = await AxionApi.getFleetVehicles();
        setVehicles(v);
      } catch { /* offline */ }
    };
    fetch();
    const id = setInterval(fetch, POLL_OTA);
    return () => clearInterval(id);
  }, []);

  const getEligibility = (v: FleetVehicle) => {
    const checks = [
      { label: `Battery > ${HEALTH.SOC_WARNING_PCT}%`, pass: v.battery > HEALTH.SOC_WARNING_PCT },
      { label: 'Online', pass: v.online },
      { label: `Temp < ${HEALTH.TEMP_CRITICAL_C}°C`, pass: v.temperature < HEALTH.TEMP_CRITICAL_C },
      { label: 'Not Critical', pass: v.healthState !== 'CRITICAL' },
    ];
    return { checks, eligible: checks.every(c => c.pass) };
  };

  const handleTrigger = async (vehicleId: string) => {
    setTriggering(vehicleId);
    const newLog: OtaLog = {
      id: ++logCounter,
      vehicleId,
      campaignId: selectedCampaign,
      status: 'pending',
      timestamp: new Date().toLocaleTimeString(),
    };
    setOtaLogs(prev => [newLog, ...prev]);

    try {
      await AxionApi.triggerOTA(selectedCampaign, vehicleId);
      setOtaLogs(prev => prev.map(l => l.id === newLog.id ? { ...l, status: 'success' as const } : l));
      toast.success(`OTA deployed to ${vehicleId}`);
    } catch {
      setOtaLogs(prev => prev.map(l => l.id === newLog.id ? { ...l, status: 'failed' as const } : l));
      toast.error(`OTA failed for ${vehicleId}`);
    } finally {
      setTriggering(null);
    }
  };

  const handleRolloutAll = async () => {
    const eligible = vehicles.filter(v => getEligibility(v).eligible);
    if (eligible.length === 0) {
      toast.error('No eligible vehicles for rollout');
      return;
    }
    toast.info(`Starting rollout to ${eligible.length} vehicles...`);
    for (const v of eligible) {
      await handleTrigger(v.vehicleId);
    }
    toast.success(`Rollout complete: ${eligible.length} vehicles updated`);
  };

  const eligibleCount = vehicles.filter(v => getEligibility(v).eligible).length;
  const successCount = otaLogs.filter(l => l.status === 'success').length;
  const failCount = otaLogs.filter(l => l.status === 'failed').length;

  return (
    <div className="p-8 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2 flex items-center gap-3">
          <CloudCog className="w-8 h-8 text-primary" /> OTA Campaign Manager
        </h1>
        <p className="text-muted-foreground">Over-the-air update orchestration and fleet deployment</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Vehicles', value: vehicles.length, icon: Rocket, gradient: 'from-cyan-500/10 to-cyan-600/5', border: 'border-cyan-500/20', text: 'text-cyan-400' },
          { label: 'Eligible', value: eligibleCount, icon: Shield, gradient: 'from-emerald-500/10 to-emerald-600/5', border: 'border-emerald-500/20', text: 'text-emerald-400' },
          { label: 'Deployed', value: successCount, icon: CheckCircle2, gradient: 'from-purple-500/10 to-purple-600/5', border: 'border-purple-500/20', text: 'text-purple-400' },
          { label: 'Failed', value: failCount, icon: XCircle, gradient: 'from-red-500/10 to-red-600/5', border: 'border-red-500/20', text: 'text-red-400' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`rounded-xl bg-gradient-to-br ${kpi.gradient} p-5 border ${kpi.border}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{kpi.label}</span>
                <Icon className={`w-4 h-4 ${kpi.text}`} />
              </div>
              <div className={`text-3xl font-semibold ${kpi.text}`}>{kpi.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Campaign Card + Rollout Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/[0.02] border border-primary/20 p-6 mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" /> Active Campaign
            </h2>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <p>Campaign ID: <span className="font-mono text-primary">{selectedCampaign}</span></p>
              <p>Target: All eligible vehicles  |  Pre-flight checks: SOC &gt; 30%, Online, Temp &lt; 55°C, Not Critical</p>
            </div>
          </div>
          <button
            onClick={handleRolloutAll}
            disabled={eligibleCount === 0}
            className="px-6 py-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              Rollout to {eligibleCount} Eligible
            </span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Eligibility Table */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 overflow-hidden"
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-medium">Vehicle Eligibility</h2>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-white/10 text-muted-foreground">
                    <th className="text-left p-4">Vehicle</th>
                    <th className="text-left p-4">Pre-flight Checks</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map(v => {
                    const { checks, eligible } = getEligibility(v);
                    return (
                      <tr key={v.vehicleId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="font-mono text-xs">{v.vehicleId}</div>
                          <div className="text-xs text-muted-foreground mt-1">{v.vendor}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5">
                            {checks.map((c, i) => (
                              <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full ${
                                c.pass ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                              }`}>
                                {c.pass ? '✓' : '✗'} {c.label}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            eligible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                          }`}>{eligible ? 'Eligible' : 'Blocked'}</span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleTrigger(v.vehicleId)}
                            disabled={!eligible || triggering === v.vehicleId}
                            className="px-3 py-1.5 text-xs bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            {triggering === v.vehicleId ? 'Deploying...' : 'Deploy'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {vehicles.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No vehicles connected. Start the simulator.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Deployment Log */}
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 overflow-hidden"
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-medium">Deployment Log</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {otaLogs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No deployments yet. Trigger an OTA update to see logs here.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {otaLogs.map(log => (
                    <motion.div key={log.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      className="p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {log.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                        {log.status === 'failed' && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                        {log.status === 'pending' && <Clock className="w-4 h-4 text-amber-400 animate-spin flex-shrink-0" />}
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-xs truncate">{log.vehicleId}</div>
                          <div className="text-[10px] text-muted-foreground">{log.timestamp} • {log.campaignId}</div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                          log.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>{log.status}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}