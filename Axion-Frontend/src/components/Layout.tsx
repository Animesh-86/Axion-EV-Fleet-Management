import { ReactNode, useState } from 'react';
import { motion } from 'motion/react';
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
  Circle
} from 'lucide-react';

type Page = 'dashboard' | 'fleet' | 'vehicles' | 'digital-twin' | 'ota' | 'analytics' | 'settings';

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedFleet, setSelectedFleet] = useState('Global Fleet');

  const navItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fleet' as Page, label: 'Fleet', icon: Car },
    { id: 'vehicles' as Page, label: 'Vehicles', icon: Car },
    { id: 'digital-twin' as Page, label: 'Digital Twin', icon: Layers },
    { id: 'ota' as Page, label: 'OTA Campaigns', icon: Upload },
    { id: 'analytics' as Page, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as Page, label: 'Settings', icon: Settings },
  ];

  const fleets = ['Global Fleet', 'North America', 'Europe', 'Asia Pacific'];

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
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
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
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                      isActive
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
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              sidebarCollapsed ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-sidebar-border">
            <p className="text-xs text-muted-foreground">Version 2.4.1</p>
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search vehicle ID..."
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Right: System Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wide">
              LIVE
            </span>
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