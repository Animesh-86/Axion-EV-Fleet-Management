import { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Battery, Thermometer, WifiOff, RotateCw } from 'lucide-react';

interface SimulatorState {
  isRunning: boolean;
  vehicleCount: number;
  batteryDrain: boolean;
  temperatureSpike: boolean;
  networkFailure: boolean;
  eventsGenerated: number;
}

export function SimulatorPage() {
  const [simulator, setSimulator] = useState<SimulatorState>({
    isRunning: false,
    vehicleCount: 10,
    batteryDrain: false,
    temperatureSpike: false,
    networkFailure: false,
    eventsGenerated: 0
  });

  const [logs, setLogs] = useState<Array<{ id: string; message: string; timestamp: Date; type: 'info' | 'warning' | 'error' }>>([
    { id: '1', message: 'Simulator initialized and ready', timestamp: new Date(), type: 'info' }
  ]);

  const handleToggleSimulator = () => {
    setSimulator(prev => ({ ...prev, isRunning: !prev.isRunning }));
    
    if (!simulator.isRunning) {
      addLog('Simulator started', 'info');
    } else {
      addLog('Simulator stopped', 'warning');
    }
  };

  const addLog = (message: string, type: 'info' | 'warning' | 'error') => {
    const newLog = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const handleInjectScenario = (scenario: string) => {
    setSimulator(prev => ({ ...prev, eventsGenerated: prev.eventsGenerated + 1 }));
    
    switch (scenario) {
      case 'battery':
        setSimulator(prev => ({ ...prev, batteryDrain: !prev.batteryDrain }));
        addLog(`Battery drain scenario ${!simulator.batteryDrain ? 'activated' : 'deactivated'}`, 'warning');
        break;
      case 'temperature':
        setSimulator(prev => ({ ...prev, temperatureSpike: !prev.temperatureSpike }));
        addLog(`Temperature spike scenario ${!simulator.temperatureSpike ? 'activated' : 'deactivated'}`, 'error');
        break;
      case 'network':
        setSimulator(prev => ({ ...prev, networkFailure: !prev.networkFailure }));
        addLog(`Network failure scenario ${!simulator.networkFailure ? 'activated' : 'deactivated'}`, 'error');
        break;
    }
  };

  const handleResetSimulator = () => {
    setSimulator({
      isRunning: false,
      vehicleCount: 10,
      batteryDrain: false,
      temperatureSpike: false,
      networkFailure: false,
      eventsGenerated: 0
    });
    setLogs([
      { id: Date.now().toString(), message: 'Simulator reset', timestamp: new Date(), type: 'info' }
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Fleet Simulator</h1>
          <p className="text-[var(--text-secondary)]">Test system behavior with simulated fleet scenarios</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            className="px-4 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--primary-400)] transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleResetSimulator}
          >
            <RotateCw className="w-4 h-4" />
            Reset
          </motion.button>
          <motion.button
            className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 text-white ${
              simulator.isRunning ? 'bg-[var(--error)]' : ''
            }`}
            style={!simulator.isRunning ? { background: 'linear-gradient(135deg, var(--primary-400) 0%, var(--secondary-400) 100%)' } : {}}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleSimulator}
          >
            {simulator.isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                Stop Simulator
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Simulator
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Simulator Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Status</div>
          <div className="flex items-center gap-2">
            <div 
              className={`w-2 h-2 rounded-full ${simulator.isRunning ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: simulator.isRunning ? '#00FF85' : '#6B7280' }}
            />
            <div className="text-xl font-bold text-[var(--text-primary)]">
              {simulator.isRunning ? 'Running' : 'Stopped'}
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Simulated Vehicles</div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{simulator.vehicleCount}</div>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Events Generated</div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{simulator.eventsGenerated}</div>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Active Scenarios</div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {[simulator.batteryDrain, simulator.temperatureSpike, simulator.networkFailure].filter(Boolean).length}
          </div>
        </div>
      </div>

      {/* Scenario Controls */}
      <motion.div
        className="p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Inject Test Scenarios</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ScenarioCard
            title="Battery Drain"
            description="Simulate rapid battery discharge across fleet"
            icon={Battery}
            color="#FFB800"
            isActive={simulator.batteryDrain}
            onClick={() => handleInjectScenario('battery')}
          />
          <ScenarioCard
            title="Temperature Spike"
            description="Inject high-temperature thermal events"
            icon={Thermometer}
            color="#FF3D71"
            isActive={simulator.temperatureSpike}
            onClick={() => handleInjectScenario('temperature')}
          />
          <ScenarioCard
            title="Network Failure"
            description="Simulate connectivity loss and reconnection"
            icon={WifiOff}
            color="#6C63FF"
            isActive={simulator.networkFailure}
            onClick={() => handleInjectScenario('network')}
          />
        </div>
      </motion.div>

      {/* Fleet Configuration */}
      <motion.div
        className="p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Fleet Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Number of Simulated Vehicles: {simulator.vehicleCount}
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={simulator.vehicleCount}
              onChange={(e) => setSimulator(prev => ({ ...prev, vehicleCount: parseInt(e.target.value) }))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{ 
                background: `linear-gradient(to right, #00E5FF 0%, #00E5FF ${simulator.vehicleCount}%, #1a2332 ${simulator.vehicleCount}%, #1a2332 100%)`
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Live Event Log */}
      <motion.div
        className="p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Live Event Log</h3>
          {simulator.isRunning && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00FF85] animate-pulse" />
              <span className="text-sm text-[var(--text-secondary)]">Live</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2 max-h-96 overflow-auto">
          {logs.map((log, index) => (
            <motion.div
              key={log.id}
              className="p-3 rounded-lg border border-[var(--border-default)] flex items-start gap-3 bg-[var(--bg-base)]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <div 
                className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                style={{ 
                  backgroundColor: log.type === 'error' ? '#FF3D71' : 
                                 log.type === 'warning' ? '#FFB800' : 'var(--primary-400)'
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-secondary)]">{log.message}</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  {log.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

interface ScenarioCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  isActive: boolean;
  onClick: () => void;
}

function ScenarioCard({ title, description, icon: Icon, color, isActive, onClick }: ScenarioCardProps) {
  return (
    <motion.button
      className={`p-6 rounded-xl border text-left transition-all ${
        isActive 
          ? 'border-current' 
          : 'border-[var(--border-default)] hover:border-[var(--primary-400)]'
      }`}
      style={{ 
        backgroundColor: isActive ? `${color}10` : 'var(--bg-base)',
        borderColor: isActive ? color : undefined
      }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {isActive && (
          <motion.div
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${color}20`, color }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            Active
          </motion.div>
        )}
      </div>
      <h4 className="font-semibold text-[var(--text-primary)] mb-1">{title}</h4>
      <p className="text-sm text-[var(--text-secondary)]">{description}</p>
    </motion.button>
  );
}
