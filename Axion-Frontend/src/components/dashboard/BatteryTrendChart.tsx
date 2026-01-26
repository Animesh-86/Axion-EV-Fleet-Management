import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const data = [
  { time: '00:00', temp: 28 },
  { time: '04:00', temp: 26 },
  { time: '08:00', temp: 31 },
  { time: '12:00', temp: 35 },
  { time: '16:00', temp: 33 },
  { time: '20:00', temp: 30 },
  { time: '24:00', temp: 29 },
];

export function BatteryTrendChart() {
  return (
    <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm text-gray-400 mb-1">Battery Temperature</h3>
          <div className="text-2xl">32.4°C</div>
        </div>
        <div className="p-2 rounded-lg bg-purple-500/10">
          <TrendingUp className="w-4 h-4 text-purple-400" />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
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
          <Line 
            type="monotone" 
            dataKey="temp" 
            stroke="#a78bfa" 
            strokeWidth={2}
            dot={{ fill: '#a78bfa', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
