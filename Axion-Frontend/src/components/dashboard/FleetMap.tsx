import { motion } from 'motion/react';
import { Navigation } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

interface Vehicle {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'online' | 'charging' | 'offline';
  battery: number;
}

interface FleetMapProps {
  onSelectVehicle: (vehicleId: string) => void;
}

export function FleetMap({ onSelectVehicle }: FleetMapProps) {
  // Mock vehicle data with positions
  const vehicles: Vehicle[] = [
    { id: 'V001', name: 'Model S', x: 20, y: 30, status: 'online', battery: 87 },
    { id: 'V002', name: 'Model X', x: 45, y: 50, status: 'charging', battery: 65 },
    { id: 'V003', name: 'Model 3', x: 70, y: 25, status: 'online', battery: 92 },
    { id: 'V004', name: 'Model S', x: 30, y: 70, status: 'offline', battery: 23 },
    { id: 'V005', name: 'Model 3', x: 80, y: 60, status: 'online', battery: 78 },
    { id: 'V006', name: 'Model X', x: 55, y: 35, status: 'online', battery: 95 },
    { id: 'V007', name: 'Model 3', x: 15, y: 55, status: 'charging', battery: 45 },
    { id: 'V008', name: 'Model S', x: 65, y: 75, status: 'online', battery: 88 },
  ];

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      {/* Map decoration lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <path d="M 100 100 Q 300 200, 500 150" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="2" fill="none" />
        <path d="M 200 300 Q 400 250, 600 350" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="2" fill="none" />
        <circle cx="300" cy="200" r="80" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" fill="none" />
        <circle cx="300" cy="200" r="120" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" fill="none" />
      </svg>

      {/* Vehicles */}
      {vehicles.map((vehicle, index) => (
        <motion.div
          key={vehicle.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="absolute cursor-pointer group"
          style={{
            left: `${vehicle.x}%`,
            top: `${vehicle.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          onClick={() => onSelectVehicle(vehicle.id)}
        >
          {/* Pulse animation for online vehicles */}
          {vehicle.status === 'online' && (
            <motion.div
              className="absolute inset-0 rounded-full bg-blue-500/30"
              animate={{ scale: [1, 2, 2], opacity: [0.5, 0, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          {/* Vehicle icon */}
          <div className={`relative z-10 p-3 rounded-full ${
            vehicle.status === 'online' ? 'bg-blue-500/20 border-blue-400' :
            vehicle.status === 'charging' ? 'bg-green-500/20 border-green-400' :
            'bg-gray-500/20 border-gray-400'
          } border-2 backdrop-blur-sm transition-all group-hover:scale-125`}>
            <Navigation className={`w-4 h-4 ${
              vehicle.status === 'online' ? 'text-blue-400' :
              vehicle.status === 'charging' ? 'text-green-400' :
              'text-gray-400'
            }`} />
          </div>

          {/* Tooltip */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-3 min-w-[150px] shadow-xl">
              <div className="text-sm mb-1">{vehicle.id}</div>
              <div className="text-xs text-gray-400 mb-2">{vehicle.name}</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Battery:</span>
                <span>{vehicle.battery}%</span>
              </div>
              <div className="mt-2">
                <StatusBadge status={vehicle.status} label={vehicle.status} size="sm" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
