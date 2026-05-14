import { PORTS, HEALTH, POLL_DASHBOARD, POLL_SYSTEM_HEALTH, TELEMETRY_HISTORY_WINDOW } from '../../config';

export function SettingsPage() {
  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-precision">System_Configuration</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mt-2 opacity-50">
             CORE_PARAMETERS • INTERFACE_PREFERENCES • NETWORK_STATES
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Settings */}
        <div className="glass-card p-6 border-white/5">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-6 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-primary" />
             Infrastructure_Interface
          </h2>
          <div className="space-y-6">
            {[
              { label: 'BACKEND_API_URL', value: `http://localhost:${PORTS.BACKEND}` },
              { label: 'MQTT_BROKER_URI', value: `localhost:${PORTS.MQTT}` },
              { label: 'REDIS_PERSISTENCE', value: `localhost:${PORTS.REDIS}` },
              { label: 'KAFKA_BOOTSTRAP', value: `localhost:${PORTS.KAFKA}` },
            ].map((cfg, i) => (
              <div key={i}>
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 block mb-2">{cfg.label}</label>
                <div className="relative group">
                   <input readOnly value={cfg.value} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-xs font-black font-mono text-precision group-hover:border-primary/30 transition-colors" />
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-primary/40 uppercase">READ_ONLY</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monitoring Settings */}
        <div className="glass-card p-6 border-white/5">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-6 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-primary" />
             Monitoring_Heuristics
          </h2>
          <div className="space-y-4">
            {[
              { label: 'DASHBOARD_POLL_INTERVAL', value: `${POLL_DASHBOARD / 1000}s` },
              { label: 'SYSTEM_HEALTH_POLL', value: `${POLL_SYSTEM_HEALTH / 1000}s` },
              { label: 'DIGITAL_TWIN_TTL', value: `${HEALTH.REDIS_TTL_SECONDS}s` },
              { label: 'TELEMETRY_WINDOW', value: `${TELEMETRY_HISTORY_WINDOW} pts` },
            ].map((cfg, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded group hover:bg-white/[0.08] transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{cfg.label}</span>
                <span className="text-xs font-black font-mono text-primary group-hover:text-precision transition-colors">{cfg.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Health Scoring Rules */}
        <div className="glass-card p-6 border-white/5 lg:col-span-2">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-6 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-primary" />
             Scoring_Engine_Constraints
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {[
                { rule: `SOC < ${HEALTH.SOC_CRITICAL_PCT}%`, penalty: `-${HEALTH.PENALTY_CRITICAL}`, severity: 'CRITICAL' },
                { rule: `SOC < ${HEALTH.SOC_WARNING_PCT}%`, penalty: `-${HEALTH.PENALTY_WARNING}`, severity: 'WARNING' },
                { rule: `BATTERY_TEMP > ${HEALTH.TEMP_CRITICAL_C}°C`, penalty: `-${HEALTH.PENALTY_CRITICAL}`, severity: 'CRITICAL' },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded text-[10px] font-black uppercase tracking-tighter">
                  <span className="text-precision opacity-80">{r.rule}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-red-400 font-bold">{r.penalty}</span>
                    <span className={`text-[8px] px-2 py-0.5 rounded border ${r.severity === 'CRITICAL' ? 'bg-red-500/5 text-red-400 border-red-500/20' : 'bg-amber-500/5 text-amber-400 border-amber-500/20'}`}>{r.severity}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[
                { rule: `BATTERY_TEMP > ${HEALTH.TEMP_WARNING_C}°C`, penalty: `-${HEALTH.PENALTY_WARNING}`, severity: 'WARNING' },
                { rule: 'NODE_CONNECTION_FAULT', penalty: `-${HEALTH.PENALTY_CRITICAL}`, severity: 'CRITICAL' },
                { rule: 'FIRMWARE_MISMATCH_STATE', penalty: '-5', severity: 'WARNING' },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded text-[10px] font-black uppercase tracking-tighter">
                  <span className="text-precision opacity-80">{r.rule}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-red-400 font-bold">{r.penalty}</span>
                    <span className={`text-[8px] px-2 py-0.5 rounded border ${r.severity === 'CRITICAL' ? 'bg-red-500/5 text-red-400 border-red-500/20' : 'bg-amber-500/5 text-amber-400 border-amber-500/20'}`}>{r.severity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/80">
              ENGINE_LOGIC: BASE_SCORE={HEALTH.BASE_SCORE} | OPTIMAL ≥ 80 | DEGRADED 50–79 | CRITICAL &lt; 50
            </p>
          </div>
        </div>

        {/* About Card */}
        <div className="glass-card p-6 border-primary/20 relative overflow-hidden group lg:col-span-2">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-xs font-black uppercase tracking-widest text-primary opacity-60 mb-6 flex items-center gap-2 relative z-10">
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
             AXION_MANIFEST
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            {[
              { label: 'VERSION_TAG', value: '1.2.0-STABLE' },
              { label: 'STACK_FOUNDATION', value: 'REACT_18 + SPRING_BOOT' },
              { label: 'INGESTION_PIPELINE', value: 'KAFKA_3.6 + REDIS_7' },
              { label: 'DESIGN_SYSTEM', value: 'KINETIC_OBSIDIAN' },
            ].map((info, i) => (
              <div key={i}>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-1">{info.label}</p>
                <p className="text-[10px] font-black uppercase text-precision">{info.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-20 text-center">
             FLEET_CONTROL_SYSTEM_UNIFIED_OS_CORE
          </p>
        </div>
      </div>
    </div>
  );
}
