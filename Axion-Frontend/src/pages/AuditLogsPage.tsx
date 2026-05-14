import { useState } from 'react';
import { FileText, Search, Filter, Shield, Activity, Lock, Users, Server } from 'lucide-react';

export function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for Phase 1
  const MOCK_LOGS = [
    { id: 'AL-1001', timestamp: '2026-05-14T10:05:22Z', user: 'admin_sys', action: 'OTA_TRIGGERED', details: 'Triggered thermal management OTA for AX-101', severity: 'HIGH', icon: Activity, color: 'text-amber-400' },
    { id: 'AL-1002', timestamp: '2026-05-14T09:42:10Z', user: 'system', action: 'POLICY_UPDATE', details: 'Global charging policy updated to 80% limit', severity: 'MEDIUM', icon: Shield, color: 'text-blue-400' },
    { id: 'AL-1003', timestamp: '2026-05-14T08:15:00Z', user: 'operator_2', action: 'LOGIN_SUCCESS', details: 'Successful authentication from 192.168.1.100', severity: 'INFO', icon: Lock, color: 'text-emerald-400' },
    { id: 'AL-1004', timestamp: '2026-05-14T07:50:33Z', user: 'operator_1', action: 'VEHICLE_DIAGNOSTIC', details: 'Requested full diagnostic for AX-205', severity: 'INFO', icon: Search, color: 'text-emerald-400' },
    { id: 'AL-1005', timestamp: '2026-05-13T23:10:05Z', user: 'system', action: 'DB_MIGRATION', details: 'TimescaleDB hypertable partitioning executed', severity: 'HIGH', icon: Server, color: 'text-primary' },
  ];

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-precision">Audit Logs</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl opacity-70 mt-2">
            Immutable ledger of system events, operator actions, and automated orchestration sequences.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary/50 transition-colors w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="p-4 font-black">Log ID</th>
                <th className="p-4 font-black">Timestamp</th>
                <th className="p-4 font-black">Actor</th>
                <th className="p-4 font-black">Action</th>
                <th className="p-4 font-black">Details</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {MOCK_LOGS.filter(log => log.details.toLowerCase().includes(searchTerm.toLowerCase()) || log.action.toLowerCase().includes(searchTerm.toLowerCase())).map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4 font-mono text-xs opacity-70 group-hover:text-primary transition-colors">{log.id}</td>
                  <td className="p-4 font-mono text-xs opacity-70">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                        <Users className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <span className="font-bold text-xs">{log.user}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <log.icon className={`w-4 h-4 ${log.color}`} />
                      <span className="font-bold tracking-tight text-xs uppercase">{log.action}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground text-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


