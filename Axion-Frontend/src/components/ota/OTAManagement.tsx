import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloudCog, Rocket, CheckCircle2, XCircle, Clock, Shield, Plus, Eye, StopCircle, ChevronRight, AlertTriangle, Zap, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { AxionApi, FleetVehicle, CampaignResponse } from '../../services/api';
import { POLL_OTA, HEALTH } from '../../config';

type WizardStep = 'closed' | 'version' | 'vehicles' | 'canary' | 'review';

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  CANARY: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  ROLLOUT: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  COMPLETED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  HALTED: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};

export function OTAManagement() {
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignResponse | null>(null);
  const [wizardStep, setWizardStep] = useState<WizardStep>('closed');
  const [wizardVersion, setWizardVersion] = useState('');
  const [wizardSelected, setWizardSelected] = useState<string[]>([]);
  const [wizardCanary, setWizardCanary] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [c, v] = await Promise.all([AxionApi.listCampaigns(), AxionApi.getFleetVehicles()]);
      setCampaigns(c);
      setVehicles(v);
      if (selectedCampaign) {
        const updated = c.find(x => x.campaignId === selectedCampaign.campaignId);
        if (updated) setSelectedCampaign(updated);
      }
    } catch { /* offline */ }
  };

  useEffect(() => { fetchData(); const id = setInterval(fetchData, POLL_OTA); return () => clearInterval(id); }, []);

  const handleCreate = async () => {
    if (!wizardVersion || wizardSelected.length === 0) return;
    setLoading(true);
    try {
      const campaign = await AxionApi.createCampaign({
        targetVersion: wizardVersion,
        vehicleIds: wizardSelected,
        canaryVehicleIds: wizardCanary,
      });
      toast.success('CAMPAIGN_INITIALIZED: ' + campaign.campaignId.slice(0, 8));
      setWizardStep('closed');
      setWizardVersion(''); setWizardSelected([]); setWizardCanary([]);
      fetchData();
    } catch { toast.error('CAMPAIGN_CREATION_FAILED'); }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    try { await AxionApi.approveCampaign(id); toast.success('CAMPAIGN_APPROVED → CANARY'); fetchData(); }
    catch { toast.error('APPROVAL_FAILED'); }
  };

  const handleHalt = async (id: string) => {
    try { await AxionApi.haltCampaign(id); toast.error('CAMPAIGN_HALTED → ROLLBACK'); fetchData(); }
    catch { toast.error('HALT_FAILED'); }
  };

  const toggleVehicle = (id: string) => setWizardSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleCanary = (id: string) => setWizardCanary(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const activeCampaigns = campaigns.filter(c => ['DRAFT', 'CANARY', 'ROLLOUT'].includes(c.status));
  const historyCampaigns = campaigns.filter(c => ['COMPLETED', 'HALTED'].includes(c.status));

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-precision">OTA_Orchestration</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mt-2 opacity-50">
            CAMPAIGN_LIFECYCLE • CANARY_DEPLOYMENT • HEALTH_GATED_ROLLOUT
          </p>
        </div>
        <button onClick={() => setWizardStep('version')}
          className="px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" /> New_Campaign
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'TOTAL_CAMPAIGNS', value: campaigns.length, icon: CloudCog, color: 'text-primary' },
          { label: 'ACTIVE', value: activeCampaigns.length, icon: Rocket, color: 'text-blue-400' },
          { label: 'COMPLETED', value: campaigns.filter(c => c.status === 'COMPLETED').length, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'HALTED', value: campaigns.filter(c => c.status === 'HALTED').length, icon: XCircle, color: 'text-red-400' },
          { label: 'FLEET_NODES', value: vehicles.length, icon: Shield, color: 'text-purple-400' },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">{kpi.label}</span>
              <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
            </div>
            <div className={`text-2xl font-black tracking-tighter text-precision ${kpi.color}`}>{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Campaign Creation Wizard Modal */}
      <AnimatePresence>
        {wizardStep !== 'closed' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-8"
            onClick={() => setWizardStep('closed')}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="glass-card p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-8">
                {['version', 'vehicles', 'canary', 'review'].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                      wizardStep === step ? 'bg-primary text-black' :
                      ['version', 'vehicles', 'canary', 'review'].indexOf(wizardStep) > i ? 'bg-primary/30 text-primary' :
                      'bg-white/5 text-muted-foreground'}`}>{i + 1}</div>
                    {i < 3 && <ChevronRight className="w-3 h-3 text-muted-foreground opacity-30" />}
                  </div>
                ))}
                <span className="ml-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
                  {wizardStep === 'version' ? 'Target_Version' : wizardStep === 'vehicles' ? 'Select_Nodes' :
                   wizardStep === 'canary' ? 'Canary_Group' : 'Review_&_Deploy'}
                </span>
              </div>

              {/* Step 1: Version */}
              {wizardStep === 'version' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black uppercase tracking-tight text-precision">Target_Firmware_Version</h3>
                  <input value={wizardVersion} onChange={e => setWizardVersion(e.target.value)}
                    placeholder="e.g. v3.4.1-hotfix"
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-sm font-mono text-precision focus:border-primary/40 outline-none" />
                  <button disabled={!wizardVersion} onClick={() => setWizardStep('vehicles')}
                    className="w-full py-3 bg-primary/10 text-primary border border-primary/30 rounded-lg font-black uppercase tracking-widest text-[10px] disabled:opacity-20">
                    Continue → Select_Vehicles
                  </button>
                </div>
              )}

              {/* Step 2: Vehicle Selection */}
              {wizardStep === 'vehicles' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase tracking-tight text-precision">Select_Target_Nodes</h3>
                    <button onClick={() => setWizardSelected(vehicles.map(v => v.vehicleId))}
                      className="text-[9px] font-black text-primary uppercase tracking-widest">Select_All</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto">
                    {vehicles.map(v => {
                      const sel = wizardSelected.includes(v.vehicleId);
                      const eligible = v.battery > HEALTH.SOC_WARNING_PCT && v.temperature < HEALTH.TEMP_CRITICAL_C && v.healthState !== 'CRITICAL';
                      return (
                        <button key={v.vehicleId} onClick={() => toggleVehicle(v.vehicleId)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            sel ? 'bg-primary/10 border-primary/30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase text-precision">{v.vehicleId}</span>
                            {!eligible && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                          </div>
                          <div className="text-[8px] text-muted-foreground mt-1 font-mono">
                            SOC:{v.battery?.toFixed(0)}% • {v.temperature?.toFixed(0)}°C • {v.healthState}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setWizardStep('version')} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase text-muted-foreground">Back</button>
                    <button disabled={wizardSelected.length === 0} onClick={() => setWizardStep('canary')}
                      className="flex-1 py-3 bg-primary/10 text-primary border border-primary/30 rounded-lg font-black uppercase tracking-widest text-[10px] disabled:opacity-20">
                      Continue → Canary ({wizardSelected.length})
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Canary Selection */}
              {wizardStep === 'canary' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-black uppercase tracking-tight text-precision">Select_Canary_Group</h3>
                  <p className="text-[10px] text-muted-foreground opacity-60">Select 2-3 vehicles for canary deployment. These will be updated first. If all pass health checks, full rollout begins.</p>
                  <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto">
                    {wizardSelected.map(vid => {
                      const isCan = wizardCanary.includes(vid);
                      return (
                        <button key={vid} onClick={() => toggleCanary(vid)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            isCan ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
                          <div className="flex items-center gap-2">
                            {isCan && <Zap className="w-3 h-3 text-amber-400" />}
                            <span className="text-xs font-black uppercase text-precision">{vid}</span>
                          </div>
                          <span className="text-[8px] text-muted-foreground">{isCan ? 'CANARY_NODE' : 'ROLLOUT_NODE'}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setWizardStep('vehicles')} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase text-muted-foreground">Back</button>
                    <button onClick={() => setWizardStep('review')}
                      className="flex-1 py-3 bg-primary/10 text-primary border border-primary/30 rounded-lg font-black uppercase tracking-widest text-[10px]">
                      Review ({wizardCanary.length} canary)
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {wizardStep === 'review' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black uppercase tracking-tight text-precision">Campaign_Review</h3>
                  <div className="space-y-3">
                    {[
                      ['Firmware', wizardVersion],
                      ['Total Vehicles', String(wizardSelected.length)],
                      ['Canary Group', wizardCanary.length > 0 ? wizardCanary.join(', ') : 'None (skip to rollout)'],
                      ['Rollout Strategy', wizardCanary.length > 0 ? 'CANARY → OBSERVE → ROLLOUT' : 'DIRECT_ROLLOUT'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between p-3 bg-white/[0.02] rounded border border-white/5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{k}</span>
                        <span className="text-xs font-black text-precision font-mono">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded text-[9px] text-amber-400 font-bold">
                    ⚠ Campaign will be created in DRAFT state. You must APPROVE to begin deployment.
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setWizardStep('canary')} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase text-muted-foreground">Back</button>
                    <button onClick={handleCreate} disabled={loading}
                      className="flex-1 py-3 bg-primary/10 text-primary border border-primary/30 rounded-lg font-black uppercase tracking-widest text-[10px] disabled:opacity-50">
                      {loading ? 'INITIALIZING...' : 'COMMIT_CAMPAIGN'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Campaigns */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40">Active_Campaigns</h2>
        {activeCampaigns.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-20 italic">NO_ACTIVE_CAMPAIGNS</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeCampaigns.map(c => {
              const style = STATUS_STYLES[c.status] || STATUS_STYLES.DRAFT;
              return (
                <motion.div key={c.campaignId} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest ${style.bg} ${style.text} border ${style.border}`}>
                        {c.status}
                      </span>
                      <span className="text-sm font-black text-precision font-mono">{c.targetVersion}</span>
                      <span className="text-[9px] text-muted-foreground font-mono opacity-40">{c.campaignId.slice(0, 8)}...</span>
                    </div>
                    <div className="flex gap-2">
                      {c.status === 'DRAFT' && (
                        <button onClick={() => handleApprove(c.campaignId)}
                          className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-1.5">
                          <Rocket className="w-3 h-3" /> Approve
                        </button>
                      )}
                      {['DRAFT', 'CANARY', 'ROLLOUT'].includes(c.status) && (
                        <button onClick={() => handleHalt(c.campaignId)}
                          className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-1.5">
                          <StopCircle className="w-3 h-3" /> Halt
                        </button>
                      )}
                      <button onClick={() => setSelectedCampaign(c)}
                        className="px-4 py-2 bg-white/5 text-muted-foreground border border-white/5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-1.5">
                        <Eye className="w-3 h-3" /> Detail
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${c.progress * 100}%` }} transition={{ duration: 0.8 }} />
                    </div>
                    <span className="text-[10px] font-black text-precision w-12 text-right">{Math.round(c.progress * 100)}%</span>
                  </div>

                  <div className="flex gap-6 mt-3 text-[9px] font-black text-muted-foreground opacity-50">
                    <span>TOTAL: {c.totalJobs}</span>
                    <span className="text-emerald-400">SUCCESS: {c.successJobs}</span>
                    <span className="text-red-400">FAILED: {c.failedJobs}</span>
                    <span className="text-amber-400">PENDING: {c.pendingJobs}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Campaign Detail Modal */}
      <AnimatePresence>
        {selectedCampaign && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-8"
            onClick={() => setSelectedCampaign(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-card p-8 w-full max-w-3xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-precision">{selectedCampaign.targetVersion}</h3>
                  <span className="text-[9px] font-mono text-muted-foreground">{selectedCampaign.campaignId}</span>
                </div>
                <span className={`px-3 py-1 rounded text-[9px] font-black uppercase ${STATUS_STYLES[selectedCampaign.status]?.bg} ${STATUS_STYLES[selectedCampaign.status]?.text} border ${STATUS_STYLES[selectedCampaign.status]?.border}`}>
                  {selectedCampaign.status}
                </span>
              </div>

              <div className="space-y-2">
                {selectedCampaign.jobs.map(job => (
                  <div key={job.jobId} className="flex items-center gap-4 p-3 bg-white/[0.02] rounded border border-white/5">
                    <div className={`w-2 h-2 rounded-full ${
                      job.state === 'SUCCESS' ? 'bg-emerald-500 shadow-[0_0_6px_#10B981]' :
                      job.state === 'FAILED' ? 'bg-red-500 shadow-[0_0_6px_#EF4444]' :
                      job.state === 'IN_PROGRESS' ? 'bg-blue-500 animate-pulse' :
                      job.state === 'ROLLED_BACK' ? 'bg-amber-500' : 'bg-white/20'}`} />
                    <span className="text-xs font-black uppercase text-precision flex-1">{job.vehicleId}</span>
                    {job.canary && <Zap className="w-3 h-3 text-amber-400" />}
                    {job.state === 'ROLLED_BACK' && <RotateCcw className="w-3 h-3 text-amber-400" />}
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                      job.state === 'SUCCESS' ? 'text-emerald-400' :
                      job.state === 'FAILED' ? 'text-red-400' :
                      job.state === 'ROLLED_BACK' ? 'text-amber-400' :
                      job.state === 'IN_PROGRESS' ? 'text-blue-400' : 'text-muted-foreground opacity-40'}`}>
                      {job.state}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaign History */}
      {historyCampaigns.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40">Campaign_History</h2>
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 border-b border-white/5">
                  <th className="text-left p-4">Campaign</th><th className="text-left p-4">Version</th>
                  <th className="text-left p-4">Status</th><th className="text-left p-4">Progress</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {historyCampaigns.map(c => {
                  const style = STATUS_STYLES[c.status] || STATUS_STYLES.DRAFT;
                  return (
                    <tr key={c.campaignId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-[10px] font-mono text-precision">{c.campaignId.slice(0, 8)}...</td>
                      <td className="p-4 text-xs font-black text-precision">{c.targetVersion}</td>
                      <td className="p-4"><span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${style.bg} ${style.text} border ${style.border}`}>{c.status}</span></td>
                      <td className="p-4 text-[10px] font-black text-emerald-400">{c.successJobs}/{c.totalJobs} OK</td>
                      <td className="p-4 text-right">
                        <button onClick={() => setSelectedCampaign(c)} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}