import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GitCommit, Clock, Activity, ShieldAlert, Zap, 
  ChevronDown, ChevronUp, Search, Filter, RefreshCw 
} from 'lucide-react';
import { AxionApi, RcaEvent } from '../../services/api';
import { toast } from 'sonner';

interface RcaTimelineProps {
  vehicleId: string;
}

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
  TELEMETRY: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: Activity },
  HEALTH: { color: 'text-purple-400', bg: 'bg-purple-500/10', icon: ShieldAlert },
  OTA: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Zap },
  ALERT: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: GitCommit },
};

const SEVERITY_CONFIG: Record<string, { border: string; badgeBg: string; text: string }> = {
  INFO: { border: 'border-slate-500/20 hover:border-slate-500/40', badgeBg: 'bg-slate-500/10', text: 'text-slate-400' },
  WARNING: { border: 'border-amber-500/30 hover:border-amber-500/50', badgeBg: 'bg-amber-500/10', text: 'text-amber-400' },
  CRITICAL: { border: 'border-red-500/40 hover:border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.1)]', badgeBg: 'bg-red-500/10', text: 'text-red-400' },
};

export function RcaTimeline({ vehicleId }: RcaTimelineProps) {
  const [events, setEvents] = useState<RcaEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeWindow, setTimeWindow] = useState<'1h' | '6h' | '24h' | 'all'>('24h');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      // Calculate ISO timestamps based on selected window
      const now = new Date();
      let fromDate: Date | undefined;
      
      if (timeWindow === '1h') {
        fromDate = new Date(now.getTime() - 60 * 60 * 1000);
      } else if (timeWindow === '6h') {
        fromDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      } else if (timeWindow === '24h') {
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const res = await AxionApi.getRcaTimeline(
        vehicleId, 
        fromDate?.toISOString(), 
        now.toISOString()
      );
      setEvents(res);
    } catch {
      toast.error('Failed to load RCA timeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [vehicleId, timeWindow]);

  // Filtered Events
  const filteredEvents = events.filter((ev) => {
    const matchCategory = categoryFilter === 'ALL' || ev.category === categoryFilter;
    const matchSeverity = severityFilter === 'ALL' || ev.severity === severityFilter;
    const matchSearch = searchQuery === '' || 
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.detail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSeverity && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Control Strip */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Time Window Selector */}
          <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground ml-2 mr-1" />
            {(['1h', '6h', '24h', 'all'] as const).map((win) => (
              <button
                key={win}
                onClick={() => setTimeWindow(win)}
                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                  timeWindow === win ? 'bg-primary text-black shadow-sm' : 'text-muted-foreground hover:text-white'
                }`}
              >
                {win}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-wider text-precision outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Categories</option>
              <option value="TELEMETRY" className="bg-slate-900 text-cyan-400">Telemetry</option>
              <option value="HEALTH" className="bg-slate-900 text-purple-400">Health</option>
              <option value="OTA" className="bg-slate-900 text-emerald-400">OTA Update</option>
            </select>
          </div>

          {/* Severity Dropdown */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-wider text-precision outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Severities</option>
              <option value="INFO" className="bg-slate-900 text-slate-400">Info</option>
              <option value="WARNING" className="bg-slate-900 text-amber-400">Warning</option>
              <option value="CRITICAL" className="bg-slate-900 text-red-400">Critical</option>
            </select>
          </div>
        </div>

        {/* Search Bar & Refresh */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search event logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-xs font-mono text-precision focus:border-primary/40 outline-none placeholder:text-muted-foreground/50"
            />
          </div>
          <button
            onClick={fetchTimeline}
            disabled={loading}
            className="p-2 bg-white/5 hover:bg-white/10 text-muted-foreground border border-white/5 rounded-lg transition-all"
            title="Reload Timeline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* Timeline List View */}
      <div className="relative pl-6 border-l-2 border-white/5 space-y-6 before:absolute before:left-[-5px] before:top-0 before:w-2 before:h-2 before:rounded-full before:bg-primary/40 after:absolute after:left-[-5px] after:bottom-0 after:w-2 after:h-2 after:rounded-full after:bg-white/10">
        {loading && events.length === 0 ? (
          <div className="py-12 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto mb-3 opacity-60" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
              Correlating across Timescale & Postgres...
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="glass-card p-8 text-center border-dashed border-white/5">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-30">
              No causal events detected matching scope criteria
            </p>
          </div>
        ) : (
          filteredEvents.map((ev, index) => {
            const cat = CATEGORY_CONFIG[ev.category] || CATEGORY_CONFIG.TELEMETRY;
            const Icon = cat.icon;
            const sev = SEVERITY_CONFIG[ev.severity] || SEVERITY_CONFIG.INFO;
            const isExpanded = expandedId === index;
            const timeObj = new Date(ev.timestamp);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="relative group"
              >
                {/* Node connector dot */}
                <div className={`absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full border-2 border-slate-950 flex items-center justify-center ${cat.bg}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${cat.color.replace('text-', 'bg-')}`} />
                </div>

                {/* Event Card */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : index)}
                  className={`glass-card p-4 border transition-all cursor-pointer select-none ${sev.border} hover:bg-white/[0.02]`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg mt-0.5 ${cat.bg} ${cat.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black uppercase tracking-wide text-precision">
                            {ev.title}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${sev.badgeBg} ${sev.text}`}>
                            {ev.severity}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-white/5 ${cat.color}`}>
                            {ev.category}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground/80 mt-1.5 line-clamp-2 group-hover:text-muted-foreground font-mono">
                          {ev.detail}
                        </p>
                      </div>
                    </div>

                    {/* Timestamp & Toggle */}
                    <div className="flex flex-col items-end justify-between h-full gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-black text-precision font-mono">
                          {timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-[9px] text-muted-foreground opacity-60 font-mono">
                          {timeObj.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div className="text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Draw */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-white/5 mt-4 pt-3"
                      >
                        <div className="bg-black/20 p-3 rounded-lg border border-white/5 font-mono text-xs text-precision/90 space-y-2">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 block">
                              Raw Record Payload
                            </span>
                            <div className="text-muted-foreground mt-0.5 whitespace-pre-wrap break-all">
                              {ev.detail}
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-white/[0.02] text-[9px] text-muted-foreground/40">
                            <span>Ingestion Source: {ev.category === 'OTA' ? 'PostgreSQL Primary' : 'TimescaleDB Stream'}</span>
                            <span>Correlation ID: {ev.timestamp.replace(/[:.]/g, '')}-{ev.vehicleId.slice(-4)}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
