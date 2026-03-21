import { ReactNode, useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  LogOut
} from 'lucide-react';
import { AxionApi } from '../services/api';

type PageType = 'dashboard' | 'fleet' | 'vehicles' | 'digital-twin' | 'ota' | 'analytics' | 'alerts' | 'system' | 'settings';

interface LayoutProps {
  children: ReactNode;
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  onSearch?: (query: string) => void;
  onBackToLanding: () => void;
}

export function Layout({ children, currentPage, onNavigate, onSearch, onBackToLanding }: LayoutProps) {
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
        // Preserve last known fleet count instead of resetting to 0
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, POLL_HEALTH_CHECK);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vehicles' as PageType, label: 'Vehicles', icon: Car },
    { id: 'digital-twin' as PageType, label: 'Digital Twin', icon: Layers },
    { id: 'ota' as PageType, label: 'OTA Campaigns', icon: Upload },
    { id: 'analytics' as PageType, label: 'Analytics', icon: BarChart3 },
    { id: 'alerts' as PageType, label: 'Alerts', icon: AlertTriangle },
    { id: 'system' as PageType, label: 'System Health', icon: Server },
    { id: 'settings' as PageType, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-sidebar border-r border-sidebar-border flex flex-col relative"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border justify-between">
          {!sidebarCollapsed ? (
            <div>
              <h1 className="text-lg font-bold text-primary tracking-tight">AXION</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Fleet Orchestrator
              </p>
            </div>
          ) : (
            <div className="text-primary text-xl font-bold">A</div>
          )}
          <button 
            onClick={onBackToLanding}
            className="p-1.5 rounded-md hover:bg-sidebar-accent text-muted-foreground transition-colors"
            title="Back to Landing Page"
          >
            <Circle className="w-4 h-4 fill-primary/20 text-primary" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isActive
                      ? 'bg-primary/10 text-primary shadow-lg shadow-primary/20'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-accent-foreground'
                      }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    )}
                    {isActive && !sidebarCollapsed && (
                      <motion.div
                        layoutId="activeTab"
                        className="ml-auto w-1 h-4 bg-primary rounded-full"
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ChevronLeft
            className={`w-4 h-4 text-muted-foreground transition-transform ${sidebarCollapsed ? 'rotate-180' : ''
              }`}
          />
        </button>

        {/* Footer */}
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
                onClick={logout}
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
              onClick={logout}
              className="text-muted-foreground hover:text-red-400 transition-colors p-2"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          {/* Left: Fleet Selector */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors">
                <span className="text-sm font-medium">{selectedFleet}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-md mx-8">
            <form
              className="relative"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim() && onSearch) {
                  onSearch(searchQuery.trim());
                  setSearchQuery('');
                }
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

          {/* Right: User + System Status */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-foreground font-medium">{user.name}</span>
                {user.company && (
                  <span className="text-muted-foreground text-xs">• {user.company}</span>
                )}
              </div>
            )}
            {fleetCount.total > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Car className="w-3.5 h-3.5" />
                <span>{fleetCount.online}/{fleetCount.total} online</span>
              </div>
            )}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${backendLive
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-red-500/10 border-red-500/20'
              }`}>
              <Circle className={`w-2 h-2 ${backendLive
                  ? 'fill-emerald-500 text-emerald-500 animate-pulse'
                  : 'fill-red-500 text-red-500'
                }`} />
              <span className={`text-xs font-semibold uppercase tracking-wide ${backendLive ? 'text-emerald-500' : 'text-red-500'
                }`}>
                {backendLive ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}