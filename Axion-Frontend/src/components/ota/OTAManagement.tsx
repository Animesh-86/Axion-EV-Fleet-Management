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
      { label: `BATTERY > ${HEALTH.SOC_WARNING_PCT}%`, pass: v.battery > HEALTH.SOC_WARNING_PCT },
      { label: 'SYNC_ACTIVE', pass: v.online },
      { label: `THERMAL < ${HEALTH.TEMP_CRITICAL_C}°C`, pass: v.temperature < HEALTH.TEMP_CRITICAL_C },
      { label: 'STATE_NOMINAL', pass: v.healthState !== 'CRITICAL' },
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
      toast.success(`DEPLOYMENT_COMPLETE: ${vehicleId}`);
    } catch {
      setOtaLogs(prev => prev.map(l => l.id === newLog.id ? { ...l, status: 'failed' as const } : l));
      toast.error(`DEPLOYMENT_FAILED: ${vehicleId}`);
    } finally {
      setTriggering(null);
    }
  };

  const handleRolloutAll = async () => {
    const eligible = vehicles.filter(v => getEligibility(v).eligible);
    if (eligible.length === 0) {
      toast.error('NO_ELIGIBLE_NODES_DETECTED');
      return;
    }
    toast.info(`EXECUTING_ROLLOUT: ${eligible.length} NODES`);
    for (const v of eligible) {
      await handleTrigger(v.vehicleId);
    }
    toast.success(`ROLLOUT_SEQUENCE_COMPLETE`);
  };

  const eligibleCount = vehicles.filter(v => getEligibility(v).eligible).length;
  const successCount = otaLogs.filter(l => l.status === 'success').length;
  const failCount = otaLogs.filter(l => l.status === 'failed').length;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-precision">OTA_Orchestration</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mt-2 opacity-50">
             FLEET_WIDE_DEPLOYMENT • FIRMWARE_STATE_SYNCHRONIZATION
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'NETWORK_NODES', value: vehicles.length, icon: Rocket, color: 'text-primary', border: 'border-primary/20', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]' },
          { label: 'ELIGIBLE_NODES', value: eligibleCount, icon: Shield, color: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]' },
          { label: 'DEPLOY_SUCCESS', value: successCount, icon: CheckCircle2, color: 'text-purple-400', border: 'border-purple-500/20', glow: 'shadow-[0_0_15px_rgba(167,139,250,0.1)]' },
          { label: 'DEPLOY_FAILURE', value: failCount, icon: XCircle, color: 'text-red-400', border: 'border-red-500/20', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.1)]' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`glass-card p-6 ${kpi.border} ${kpi.glow}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">{kpi.label}</span>
                <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
              <div className={`text-3xl font-black tracking-tighter text-precision ${kpi.color}`}>{kpi.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Active Campaign Card */}
      <div className="glass-card p-8 border-primary/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-all duration-1000" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-primary/10 rounded border border-primary/20">
                  <Upload className="w-5 h-5 text-primary" />
               </div>
               <h2 className="text-xl font-black uppercase tracking-tighter text-precision">Active_Deployment_Campaign</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-1">Campaign_Reference</p>
                    <p className="text-sm font-black text-primary font-mono">{selectedCampaign}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-1">Deployment_Type</p>
                    <p className="text-xs font-bold uppercase tracking-tight text-muted-foreground">CRITICAL_FIRMWARE_V3.4_HOTFIX</p>
                  </div>
               </div>
               <div className="p-4 bg-white/5 border border-white/5 rounded-lg">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-3">Pre-Flight_Constraint_Set</p>
                  <div className="flex flex-wrap gap-2">
                     {['SOC_30%_MIN', 'SYNC_REACHABLE', 'THERMAL_NOMINAL', 'HEALTH_OPTIMAL'].map(t => (
                       <span key={t} className="text-[8px] font-black px-2 py-0.5 bg-white/5 border border-white/5 rounded uppercase tracking-tighter text-muted-foreground opacity-60">{t}</span>
                     ))}
                  </div>
               </div>
            </div>
          </div>
          
          <button
            onClick={handleRolloutAll}
            disabled={eligibleCount === 0}
            className="w-full md:w-auto px-10 py-5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed group/btn overflow-hidden relative"
          >
            <div className="flex items-center gap-3 justify-center relative z-10">
              <Rocket className="w-4 h-4 group-hover/btn:-translate-y-1 transition-transform" />
              <span>Initialize_Full_Rollout</span>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Vehicle Eligibility Table */}
        <div className="col-span-12 lg:col-span-8">
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40">Target_Node_Eligibility</h2>
            </div>
            <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 border-b border-white/5">
                    <th className="text-left p-6 font-black">Node_Identity</th>
                    <th className="text-left p-6 font-black">Pre-Flight_Heuristics</th>
                    <th className="text-left p-6 font-black">State</th>
                    <th className="text-right p-6 font-black">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {vehicles.map(v => {
                    const { checks, eligible } = getEligibility(v);
                    return (
                      <tr key={v.vehicleId} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-6">
                          <div className="text-sm font-black uppercase tracking-tight text-precision group-hover:text-primary transition-colors">{v.vehicleId}</div>
                          <div className="text-[10px] font-bold text-muted-foreground opacity-40 uppercase tracking-wider mt-1">{v.vendor}</div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-wrap gap-2">
                            {checks.map((c, i) => (
                              <span key={i} className={`text-[8px] font-black px-2 py-0.5 rounded border ${
                                c.pass ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-red-500/5 text-red-400 border-red-500/20'
                              }`}>
                                {c.label}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase tracking-tighter ${
                            eligible ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]' : 'bg-white/5 text-muted-foreground opacity-40 border-white/5'
                          }`}>{eligible ? 'READY' : 'BLOCKED'}</span>
                        </td>
                        <td className="p-6 text-right">
                          <button
                            onClick={() => handleTrigger(v.vehicleId)}
                            disabled={!eligible || triggering === v.vehicleId}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-[0.95]"
                          >
                            {triggering === v.vehicleId ? 'EXECUTING...' : 'INIT_DEPLOY'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {vehicles.length === 0 && (
                    <tr><td colSpan={4} className="p-12 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30 italic">No_Network_Nodes_Connected</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Deployment Log */}
        <div className="col-span-12 lg:col-span-4">
          <div className="glass-card h-full flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40">Orchestration_Log</h2>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {otaLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center p-12 text-center">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-20 italic">WAITING_FOR_ORCHESTRATION_INPUT...</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {otaLogs.map(log => (
                    <motion.div key={log.id} initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }}
                      className="p-5 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          log.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' :
                          log.status === 'failed' ? 'bg-red-500 shadow-[0_0_8px_#EF4444]' :
                          'bg-amber-500 animate-pulse'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-black uppercase tracking-tight text-precision truncate">{log.vehicleId}</div>
                          <div className="text-[9px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest mt-0.5">{log.timestamp} • {log.campaignId}</div>
                        </div>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                          log.status === 'success' ? 'text-emerald-400' :
                          log.status === 'failed' ? 'text-red-400' :
                          'text-amber-400'
                        }`}>[{log.status}]</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}