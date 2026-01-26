import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Gauge } from 'lucide-react';

const data = [
  { time: '00:00', speed: 0 },
  { time: '04:00', speed: 45 },
  { time: '08:00', speed: 85 },
  { time: '12:00', speed: 60 },
  { time: '16:00', speed: 95 },
  { time: '20:00', speed: 40 },
  { time: '24:00', speed: 10 },
];

export function SpeedChart() {
  return (
    <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm text-gray-400 mb-1">Avg Speed Over Time</h3>
          <div className="text-2xl">68 km/h</div>
        </div>
        <div className="p-2 rounded-lg bg-cyan-500/10">
          <Gauge className="w-4 h-4 text-cyan-400" />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="time" 
            stroke="rgba(255,255,255,0.3)"
            style={{ fontSize: '11px' }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.3)"
            style={{ fontSize: '11px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Area 
            type="monotone" 
            dataKey="speed" 
            stroke="#06b6d4" 
            strokeWidth={2}
            fill="url(#speedGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
