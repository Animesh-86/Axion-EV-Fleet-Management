interface StatusBadgeProps {
  status: 'online' | 'charging' | 'offline' | 'warning' | 'critical' | 'success' | 'info';
  label: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const styles = {
    online: 'bg-green-500/10 text-green-400 border-green-500/20',
    charging: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    offline: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border ${styles[status]} ${sizeStyles[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'online' || status === 'charging' || status === 'success' ? 'bg-current animate-pulse' : 'bg-current'}`} />
      {label}
    </span>
  );
}
