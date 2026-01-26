import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BatteryCharging } from 'lucide-react';

const data = [
  { day: 'Mon', sessions: 45 },
  { day: 'Tue', sessions: 52 },
  { day: 'Wed', sessions: 48 },
  { day: 'Thu', sessions: 61 },
  { day: 'Fri', sessions: 55 },
  { day: 'Sat', sessions: 38 },
  { day: 'Sun', sessions: 42 },
];

export function ChargingPatternsChart() {
  return (
    <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm text-gray-400 mb-1">Charging Patterns</h3>
          <div className="text-2xl">341 sessions/week</div>
        </div>
        <div className="p-2 rounded-lg bg-green-500/10">
          <BatteryCharging className="w-4 h-4 text-green-400" />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="day" 
            stroke="rgba(255,255,255,0.3)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.3)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Bar 
            dataKey="sessions" 
            fill="#22c55e"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
