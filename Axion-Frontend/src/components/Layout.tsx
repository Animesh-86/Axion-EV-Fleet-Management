import { ReactNode, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation, matchPath } from 'react-router-dom';
import { POLL_HEALTH_CHECK } from '../config';
import { useAuth } from '../services/auth';
import {
  LayoutDashboard,
  Car,
  Layers,
  Upload,
  BarChart3,
  Settings,
  ChevronLeft,
  Search,
  ChevronDown,
  Circle,
  AlertTriangle,
  Server,
  LogOut,
} from 'lucide-react';
import { AxionApi } from '../services/api';
import { LAST_VEHICLE_STORAGE_KEY, paths } from '../constants/navigation';

type NavId = 'dashboard' | 'vehicles' | 'digital-twin' | 'ota' | 'analytics' | 'alerts' | 'system' | 'settings';

interface LayoutProps {
  children: ReactNode;
}

function navItemActive(id: NavId, pathname: string): boolean {
  switch (id) {
    case 'dashboard':
      return !!matchPath({ path: paths.dashboard, end: true }, pathname);
    case 'vehicles':
      return pathname === paths.vehicles;
    case 'digital-twin':
      return !!matchPath({ path: '/vehicles/:vehicleId', end: true }, pathname);
    case 'ota':
      return !!matchPath({ path: paths.ota, end: true }, pathname);
    case 'analytics':
      return !!matchPath({ path: paths.analytics, end: true }, pathname);
    case 'alerts':
      return !!matchPath({ path: paths.alerts, end: true }, pathname);
    case 'system':
      return !!matchPath({ path: paths.system, end: true }, pathname);
    case 'settings':
      return !!matchPath({ path: paths.settings, end: true }, pathname);
    default:
      return false;
  }
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedFleet] = useState('Global Fleet');
  const [searchQuery, setSearchQuery] = useState('');
  const [backendLive, setBackendLive] = useState(false);
  const [fleetCount, setFleetCount] = useState({ total: 0, online: 0 });

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const summary = await AxionApi.getFleetSummary();
        setBackendLive(true);
        setFleetCount({ total: summary.totalVehicles, online: summary.onlineVehicles });
      } catch {
        setBackendLive(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, POLL_HEALTH_CHECK);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: NavId; label: string; icon: typeof LayoutDashboard; path: string | null }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: paths.dashboard },
    { id: 'vehicles', label: 'Vehicles', icon: Car, path: paths.vehicles },
    { id: 'digital-twin', label: 'Digital Twin', icon: Layers, path: null },
    { id: 'ota', label: 'OTA Campaigns', icon: Upload, path: paths.ota },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: paths.analytics },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, path: paths.alerts },
    { id: 'system', label: 'System Health', icon: Server, path: paths.system },
    { id: 'settings', label: 'Settings', icon: Settings, path: paths.settings },
  ];

  const goNav = (id: NavId, path: string | null) => {
    if (id === 'digital-twin') {
      const last = sessionStorage.getItem(LAST_VEHICLE_STORAGE_KEY);
      navigate(last ? paths.vehicle(last) : paths.vehicles);
      return;
    }
    if (path) navigate(path);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/30">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        transition={{ type: 'spring', stiffness: 420, damping: 38 }}
        className="glass-panel flex flex-col relative z-50 shadow-2xl"
      >
        <div className="h-16 flex items-center px-6 border-b border-white/5 justify-between">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <Car className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-black text-foreground tracking-tighter uppercase leading-none">
                  AXION<span className="text-primary">_</span>
                </h1>
                <p className="text-[8px] text-muted-foreground uppercase tracking-[0.2em] font-bold mt-0.5 opacity-50">Fleet OS</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto bg-primary rounded flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
               <Car className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
        </div>

        <nav className="flex-1 py-6 overflow-y-auto px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = navItemActive(item.id, pathname);
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => goNav(item.id, item.path)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                  />
                )}
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary' : 'group-hover:text-foreground opacity-70 group-hover:opacity-100'}`} />
                {!sidebarCollapsed && <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>}
              </motion.button>
            );
          })}
        </nav>

        {/* Sidebar Toggle */}
        <motion.button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border border-white/10 rounded-full flex items-center justify-center hover:border-primary/50 shadow-xl transition-colors z-50"
        >
          <ChevronLeft className={`w-3 h-3 text-muted-foreground transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </motion.button>

        {/* User Profile */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                  <span className="text-xs font-bold text-primary">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <div className="min-w-0">
                   <p className="text-[10px] font-bold text-foreground truncate">{user?.name || 'OPERATOR'}</p>
                   <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">Admin</p>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => { logout(); navigate(paths.login); }}
              className={`text-muted-foreground hover:text-red-400 transition-colors p-2 ${sidebarCollapsed ? 'mx-auto' : ''}`}
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-background/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 z-40">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
               <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{selectedFleet}</span>
            </div>
            
            <form
              className="relative hidden md:block"
              onSubmit={(e) => {
                e.preventDefault();
                const q = searchQuery.trim();
                if (!q) return;
                sessionStorage.setItem(LAST_VEHICLE_STORAGE_KEY, q);
                navigate(paths.vehicle(q));
                setSearchQuery('');
              }}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground opacity-50" />
              <input
                type="text"
                placeholder="SEARCH VEHICLE ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold tracking-widest focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
              />
            </form>
          </div>

          <div className="flex items-center gap-6">
            {fleetCount.total > 0 && (
              <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 opacity-50" />
                  <span>TOTAL: <span className="text-foreground">{fleetCount.total}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 opacity-50" />
                  <span>ONLINE: <span className="text-emerald-400">{fleetCount.online}</span></span>
                </div>
              </div>
            )}

            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                backendLive ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
              }`}>
              <div className={`w-1 h-1 rounded-full ${backendLive ? 'bg-emerald-500 animate-pulse shadow-[0_0_5px_#10B981]' : 'bg-red-500'}`} />
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${backendLive ? 'text-emerald-500' : 'text-red-500'}`}>
                {backendLive ? 'SYSTEM_ONLINE' : 'CORE_OFFLINE'}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto relative bg-[#0D0F14]">
          {/* Subtle grid background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
