import { motion } from 'motion/react';
import { AlertTriangle, AlertCircle, Info, TrendingDown } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  vehicle: string;
  time: string;
  message: string;
}

const alerts: Alert[] = [
  {
    id: '1',
    severity: 'critical',
    title: 'Battery Failure Predicted',
    vehicle: 'V-2847',
    time: '2m ago',
    message: 'AI model detected anomalous battery degradation',
  },
  {
    id: '2',
    severity: 'warning',
    title: 'High Temperature Alert',
    vehicle: 'V-1923',
    time: '5m ago',
    message: 'Battery temperature exceeding threshold at 45°C',
  },
  {
    id: '3',
    severity: 'critical',
    title: 'Motor Fault Detected',
    vehicle: 'V-3241',
    time: '12m ago',
    message: 'Rear motor showing unusual vibration patterns',
  },
  {
    id: '4',
    severity: 'info',
    title: 'OTA Update Available',
    vehicle: 'V-1847',
    time: '18m ago',
    message: 'Firmware v2.4.1 ready for deployment',
  },
  {
    id: '5',
    severity: 'warning',
    title: 'Low Battery Warning',
    vehicle: 'V-4562',
    time: '23m ago',
    message: 'Battery level dropped below 15%',
  },
  {
    id: '6',
    severity: 'info',
    title: 'Charging Complete',
    vehicle: 'V-2314',
    time: '31m ago',
    message: 'Vehicle fully charged and ready',
  },
];

export function AlertsFeed() {
  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return AlertTriangle;
      case 'warning':
        return AlertCircle;
      default:
        return Info;
    }
  };

  return (
    <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 overflow-hidden h-[calc(100vh-180px)] flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h3 className="text-lg mb-1">Real-Time Alerts</h3>
        <p className="text-sm text-gray-500">AI-powered fleet monitoring</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {alerts.map((alert, index) => {
          const Icon = getIcon(alert.severity);
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  alert.severity === 'critical' ? 'bg-red-500/10' :
                  alert.severity === 'warning' ? 'bg-yellow-500/10' :
                  'bg-blue-500/10'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    alert.severity === 'critical' ? 'text-red-400' :
                    alert.severity === 'warning' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{alert.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span>{alert.vehicle}</span>
                    <span>•</span>
                    <span>{alert.time}</span>
                  </div>
                  <p className="text-xs text-gray-400">{alert.message}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
