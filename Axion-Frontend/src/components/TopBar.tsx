import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Search, ChevronDown, User, Bell, Zap, Settings, Palette, Check, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../services/auth';

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/dashboard/fleet', label: 'Fleet' },
  { path: '/dashboard/digital-twin', label: 'Digital Twin' },
  { path: '/dashboard/ota-campaigns', label: 'OTA Campaign' },
  { path: '/dashboard/analytics', label: 'Analytics' },
  { path: '/dashboard/simulator', label: 'Simulator' },
];

export function TopBar() {
  const [systemStatus] = useState<'live' | 'degraded'>('live');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard/digital-twin/${searchQuery.trim()}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <div className="h-16 border-b border-[#1a2332] px-8 flex items-center justify-between bg-[var(--bg-surface)]">
      {/* Logo - Left Side */}
      <div className="flex-1">
        <Link to="/dashboard" className="flex items-center gap-2.5 w-fit">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary-400) 0%, var(--secondary-400) 100%)' }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-[var(--text-primary)] text-lg tracking-tight">Axion</span>
        </Link>
      </div>

      {/* Center Navigation */}
      <nav className="flex items-center gap-8 justify-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative"
            >
              <motion.div
                className={`text-sm font-medium transition-colors relative pb-1 ${
                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                whileHover={{ y: -1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[var(--primary-400)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Right side utilities */}
      <div className="flex items-center gap-4 justify-end flex-1 ml-12">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 bg-[var(--bg-base)] text-[var(--text-primary)] text-sm pl-9 pr-3 py-1.5 rounded-md border border-[var(--border-default)] focus:border-[var(--primary-400)]/50 focus:outline-none transition-colors placeholder:text-[var(--text-tertiary)]"
          />
        </form>

        {/* Divider */}
        <div className="h-6 w-px bg-[var(--border-default)]" />

        {/* System Status */}
        <motion.div
          className="flex items-center gap-2 px-2.5 py-1 rounded-md"
          style={{ 
            backgroundColor: systemStatus === 'live' ? 'rgba(0, 255, 133, 0.08)' : 'rgba(255, 184, 0, 0.08)',
          }}
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div 
            className="w-1.5 h-1.5 rounded-full"
            style={{ 
              backgroundColor: systemStatus === 'live' ? 'var(--success)' : 'var(--warning)',
              boxShadow: systemStatus === 'live' 
                ? '0 0 6px var(--success-muted)' 
                : '0 0 6px var(--warning-muted)'
            }}
          />
          <span className="text-xs font-medium tracking-wide" style={{ color: systemStatus === 'live' ? 'var(--success)' : 'var(--warning)' }}>
            {systemStatus.toUpperCase()}
          </span>
        </motion.div>

        {/* Notifications */}
        <button className="relative p-2 rounded-md hover:bg-[var(--bg-surface-raised)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#FF3D71] rounded-full" />
        </button>

        {/* User Profile with Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:shadow-lg transition-shadow" 
            style={{ 
              background: 'linear-gradient(135deg, var(--primary-400) 0%, var(--secondary-400) 100%)',
              boxShadow: '0 0 16px var(--primary-glow)'
            }}
          >
            <User className="w-4.5 h-4.5 text-white" />
          </button>

          {/* User Dropdown Menu */}
          <AnimatePresence>
            {isUserMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsUserMenuOpen(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-[var(--border-default)] shadow-xl z-20 bg-[var(--bg-surface)]"
                >
                  {/* User Info Header */}
                  <div className="p-4 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary-400) 0%, var(--secondary-400) 100%)' }}>
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--text-primary)]">{user?.name || 'Fleet Operator'}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{user?.email || 'operator@axion.io'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2 space-y-1">
                    <Link 
                      to="/settings"
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 text-[var(--primary-400)]" />
                      <span>Settings</span>
                    </Link>

                    {/* Appearance Button */}
                    <button
                      onClick={() => setIsAppearanceOpen(!isAppearanceOpen)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Palette className="w-4 h-4 text-[var(--secondary-400)]" />
                        <span>Appearance</span>
                      </div>
                      <motion.div
                        animate={{ rotate: isAppearanceOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>

                    {/* Collapsible Appearance Options */}
                    <AnimatePresence>
                      {isAppearanceOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-1 pl-2 pt-1">
                            <button
                              onClick={() => setTheme('light')}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-all ${
                                theme === 'light'
                                  ? 'bg-[var(--primary-400)]/10 text-[var(--text-primary)]'
                                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded bg-gradient-to-br from-white to-gray-100 border border-gray-200" />
                                <span>Light</span>
                              </div>
                              {theme === 'light' && (
                                <Check className="w-4 h-4 text-[var(--primary-400)]" />
                              )}
                            </button>

                            <button
                              onClick={() => setTheme('dark')}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-all ${
                                theme === 'dark'
                                  ? 'bg-[var(--primary-400)]/10 text-[var(--text-primary)]'
                                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700" />
                                <span>Dark</span>
                              </div>
                              {theme === 'dark' && (
                                <Check className="w-4 h-4 text-[var(--primary-400)]" />
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sign Out */}
                  <div className="p-2 border-t border-[var(--border-subtle)]">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-[#FF3D71]" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
