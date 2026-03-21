import { motion } from 'motion/react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Heart, Thermometer, TrendingUp } from 'lucide-react';

export function FleetAnalytics() {
  const healthData = [
    { name: 'Healthy', value: 218, color: '#10b981' },
    { name: 'Critical', value: 32, color: '#ef4444' },
  ];

  const temperatureData = [
    { range: '<25°C', value: 0 },
    { range: '25-35°C', value: 135 },
    { range: '35-45°C', value: 95 },
    { range: '45-55°C', value: 0 },
    { range: '>55°C', value: 20 },
  ];

  const vehicleRanking = [
    { id: 'fleet-c-003', status: 'Online', health: 'CRITICAL', battery: 76, temp: '72.0°C', score: 40 },
    { id: 'fleet-c-009', status: 'Online', health: 'CRITICAL', battery: 73, temp: '75.0°C', score: 40 },
    { id: 'v859', status: 'Online', health: 'CRITICAL', battery: 75, temp: '74.0°C', score: 40 },
    { id: 'fleet-c-021', status: 'Online', health: 'CRITICAL', battery: 80, temp: '74.0°C', score: 40 },
    { id: 'fleet-c-007', status: 'Online', health: 'CRITICAL', battery: 71, temp: '74.0°C', score: 40 },
  ];

  return (
    <section className="relative py-20 bg-black px-4">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(var(--axion-cyan)_1px,transparent_1px),linear-gradient(90deg,var(--axion-cyan)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-[var(--font-outfit)] font-black text-white mb-4">
            Fleet Analytics{' '}
            <span className="text-[var(--axion-cyan)]">Live Dashboard</span>
          </h2>
          <p className="text-xl text-gray-400 font-[var(--font-outfit)] max-w-3xl mx-auto">
            Real-time health monitoring, thermal profiling, and performance scoring across your entire fleet
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Health Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-xl bg-[#0f1419] border border-gray-800"
          >
            <div className="flex items-center gap-3 mb-8">
              <Heart className="w-6 h-6 text-[var(--axion-cyan)]" />
              <h3 className="text-2xl font-[var(--font-outfit)] font-bold text-white">
                Health Distribution
              </h3>
            </div>

            <div className="flex items-center gap-12">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={healthData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {healthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-4">
                {healthData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-400 font-[var(--font-outfit)]">
                      {item.name}
                    </span>
                    <span className="text-white font-[var(--font-jetbrains)] font-bold ml-auto">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Temperature Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-xl bg-[#0f1419] border border-gray-800"
          >
            <div className="flex items-center gap-3 mb-8">
              <Thermometer className="w-6 h-6 text-[var(--axion-cyan)]" />
              <h3 className="text-2xl font-[var(--font-outfit)] font-bold text-white">
                Temperature Distribution
              </h3>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={temperatureData}>
                  <XAxis
                    dataKey="range"
                    stroke="#4b5563"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <YAxis
                    stroke="#4b5563"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={{ stroke: '#374151' }}
                    ticks={[0, 35, 70, 105, 140]}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {temperatureData.map((entry, index) => {
                      let color = '#10b981'; // green
                      if (entry.range === '35-45°C') color = '#f59e0b'; // orange
                      if (entry.range === '>55°C') color = '#ef4444'; // red
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Vehicle Performance Ranking */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-8 rounded-xl bg-[#0f1419] border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-6 h-6 text-[var(--axion-cyan)]" />
            <h3 className="text-2xl font-[var(--font-outfit)] font-bold text-white">
              Vehicle Performance Ranking
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-4 text-sm text-gray-400 font-[var(--font-outfit)] font-medium">
                    Vehicle
                  </th>
                  <th className="text-left py-4 px-4 text-sm text-gray-400 font-[var(--font-outfit)] font-medium">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 text-sm text-gray-400 font-[var(--font-outfit)] font-medium">
                    Health
                  </th>
                  <th className="text-left py-4 px-4 text-sm text-gray-400 font-[var(--font-outfit)] font-medium">
                    Battery
                  </th>
                  <th className="text-left py-4 px-4 text-sm text-gray-400 font-[var(--font-outfit)] font-medium">
                    Temperature
                  </th>
                  <th className="text-left py-4 px-4 text-sm text-gray-400 font-[var(--font-outfit)] font-medium">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehicleRanking.map((vehicle, index) => (
                  <motion.tr
                    key={vehicle.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors"
                  >
                    <td className="py-4 px-4 text-white font-[var(--font-jetbrains)] text-sm">
                      {vehicle.id}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                        <span className="text-[#10b981] font-[var(--font-outfit)] text-sm">
                          {vehicle.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[#ef4444] font-[var(--font-jetbrains)] text-sm font-bold">
                        {vehicle.health}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden max-w-[80px]">
                          <div
                            className="h-full bg-[#10b981] rounded-full"
                            style={{ width: `${vehicle.battery}%` }}
                          />
                        </div>
                        <span className="text-gray-400 font-[var(--font-jetbrains)] text-sm">
                          {vehicle.battery}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[#ef4444] font-[var(--font-jetbrains)] text-sm">
                        {vehicle.temp}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[#f59e0b] font-[var(--font-jetbrains)] text-lg font-bold">
                        {vehicle.score}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Stats */}
          <div className="mt-8 pt-6 border-t border-gray-800 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-[var(--font-outfit)] font-black text-[var(--axion-cyan)] mb-1">
                5
              </div>
              <div className="text-sm text-gray-400 font-[var(--font-jetbrains)]">
                Critical Vehicles
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-[var(--font-outfit)] font-black text-[var(--axion-cyan)] mb-1">
                74.4°C
              </div>
              <div className="text-sm text-gray-400 font-[var(--font-jetbrains)]">
                Avg Temperature
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-[var(--font-outfit)] font-black text-[var(--axion-cyan)] mb-1">
                75%
              </div>
              <div className="text-sm text-gray-400 font-[var(--font-jetbrains)]">
                Avg Battery Level
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}