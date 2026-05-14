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
    <div className="flex h-screen bg-background overflow-hidden">
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        transition={{ type: 'spring', stiffness: 420, damping: 38 }}
        className="bg-sidebar/95 backdrop-blur-md border-r border-sidebar-border flex flex-col relative shadow-[4px_0_24px_-8px_rgba(0,0,0,0.4)]"
      >
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border/80 justify-between">
          {!sidebarCollapsed ? (
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                AXION<span className="text-primary">.</span>
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.14em]">Fleet Orchestrator</p>
            </div>
          ) : (
            <div className="text-foreground text-xl font-bold">
              A<span className="text-primary">.</span>
            </div>
          )}
          <motion.button
            type="button"
            onClick={() => navigate(paths.landing)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="p-1.5 rounded-md hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Back to Landing Page"
          >
            <Circle className="w-4 h-4 fill-primary/15 text-primary" />
          </motion.button>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = navItemActive(item.id, pathname);
              return (
                <li key={item.id}>
                  <motion.button
                    type="button"
                    onClick={() => goNav(item.id, item.path)}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group ${
                      isActive
                        ? 'bg-primary/[0.08] text-primary border border-primary/15'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-accent-foreground border border-transparent'
                    }`}
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-full bg-primary"
                        aria-hidden
                      />
                    )}
                    <Icon className={`w-5 h-5 flex-shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                    {!sidebarCollapsed && <span className="text-sm font-medium truncate pl-0.5">{item.label}</span>}
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </nav>

        <motion.button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-accent hover:border-primary/25 shadow-md transition-colors"
        >
          <ChevronLeft
            className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
          />
        </motion.button>

        {!sidebarCollapsed ? (
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <span className="text-sm text-foreground truncate">{user?.name || 'User'}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate(paths.login);
                }}
                className="text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Version 1.2.0</p>
          </div>
        ) : (
          <div className="p-2 border-t border-sidebar-border flex justify-center">
            <button
              type="button"
              onClick={() => {
                logout();
                navigate(paths.login);
              }}
              className="text-muted-foreground hover:text-red-400 transition-colors p-2"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-card/85 backdrop-blur-md border-b border-border/80 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 bg-background/80 border border-border rounded-lg hover:border-primary/30 hover:bg-muted/30 transition-colors"
              >
                <span className="text-sm font-medium">{selectedFleet}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <form
              className="relative"
              onSubmit={(e) => {
                e.preventDefault();
                const q = searchQuery.trim();
                if (!q) return;
                sessionStorage.setItem(LAST_VEHICLE_STORAGE_KEY, q);
                navigate(paths.vehicle(q));
                setSearchQuery('');
              }}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search vehicle ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </form>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-foreground font-medium">{user.name}</span>
                {user.company && <span className="text-muted-foreground text-xs">• {user.company}</span>}
              </div>
            )}
            {fleetCount.total > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Car className="w-3.5 h-3.5" />
                <span>
                  {fleetCount.online}/{fleetCount.total} online
                </span>
              </div>
            )}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                backendLive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'
              }`}
            >
              <Circle
                className={`w-2 h-2 ${
                  backendLive ? 'fill-emerald-500 text-emerald-500 animate-pulse' : 'fill-red-500 text-red-500'
                }`}
              />
              <span className={`text-xs font-semibold uppercase tracking-wide ${backendLive ? 'text-emerald-500' : 'text-red-500'}`}>
                {backendLive ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
