import { useState } from 'react';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { FleetDashboard } from './components/dashboard/FleetDashboard';
import { VehicleList } from './components/vehicle/VehicleList';
import { VehicleDetail } from './components/vehicle/VehicleDetail';
import { OTAManagement } from './components/ota/OTAManagement';
import { Analytics } from './components/analytics/Analytics';
import { AlertsAnalytics } from './components/alerts/AlertsAnalytics';
import { SystemHealth } from './components/system/SystemHealth';
import { AuthProvider, useAuth } from './services/auth';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { LandingPage } from './app/pages/LandingPage';
import { ArchitecturePage } from './app/pages/ArchitecturePage';
import { PORTS, HEALTH, POLL_DASHBOARD, POLL_SYSTEM_HEALTH, TELEMETRY_HISTORY_WINDOW } from './config';

type Page = 'dashboard' | 'fleet' | 'vehicles' | 'digital-twin' | 'ota' | 'analytics' | 'alerts' | 'system' | 'settings' | 'landing' | 'architecture';
type AuthPage = 'login' | 'signup' | 'landing' | 'architecture';

interface AuthenticatedAppProps {
  onBackToLanding: () => void;
  initialPage?: Page;
}

function AuthenticatedApp({ onBackToLanding, initialPage = 'dashboard' }: AuthenticatedAppProps) {
  const [currentPage, setCurrentPage] = useState<Page>(initialPage);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <FleetDashboard />;

      case 'vehicles':
        return <VehicleList onSelectVehicle={(id) => {
          setSelectedVehicleId(id);
          setCurrentPage('digital-twin');
        }} />;
      case 'digital-twin':
        return <VehicleDetail vehicleId={selectedVehicleId} onBack={() => setCurrentPage('vehicles')} />;
      case 'ota':
        return <OTAManagement />;
      case 'analytics':
        return <Analytics />;
      case 'alerts':
        return <AlertsAnalytics />;
      case 'system':
        return <SystemHealth />;
      case 'settings':
        return (
          <div className="p-8 pb-16">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold mb-2">Settings</h1>
              <p className="text-muted-foreground">System configuration and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
              {/* Connection Settings */}
              <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6">
                <h2 className="text-lg font-medium mb-4">Connection</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Backend API URL</label>
                    <input readOnly value={`http://localhost:${PORTS.BACKEND}`} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">MQTT Broker</label>
                    <input readOnly value={`localhost:${PORTS.MQTT}`} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Redis</label>
                    <input readOnly value={`localhost:${PORTS.REDIS}`} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Kafka Bootstrap</label>
                    <input readOnly value={`localhost:${PORTS.KAFKA}`} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono" />
                  </div>
                </div>
              </div>

              {/* Polling & Thresholds */}
              <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6">
                <h2 className="text-lg font-medium mb-4">Monitoring</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-sm">Dashboard poll interval</span>
                    <span className="text-sm font-mono text-primary">{POLL_DASHBOARD / 1000}s</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-sm">System health poll interval</span>
                    <span className="text-sm font-mono text-primary">{POLL_SYSTEM_HEALTH / 1000}s</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-sm">Digital Twin TTL</span>
                    <span className="text-sm font-mono text-primary">{HEALTH.REDIS_TTL_SECONDS}s</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-sm">Telemetry history window</span>
                    <span className="text-sm font-mono text-primary">{TELEMETRY_HISTORY_WINDOW} points</span>
                  </div>
                </div>
              </div>

              {/* Health Scoring Rules */}
              <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6">
                <h2 className="text-lg font-medium mb-4">Health Scoring Rules</h2>
                <div className="space-y-2">
                  {[
                    { rule: `SOC < ${HEALTH.SOC_CRITICAL_PCT}%`, penalty: `-${HEALTH.PENALTY_CRITICAL}`, severity: 'critical' },
                    { rule: `SOC < ${HEALTH.SOC_WARNING_PCT}%`, penalty: `-${HEALTH.PENALTY_WARNING}`, severity: 'warning' },
                    { rule: `Battery Temp > ${HEALTH.TEMP_CRITICAL_C}°C`, penalty: `-${HEALTH.PENALTY_CRITICAL}`, severity: 'critical' },
                    { rule: `Battery Temp > ${HEALTH.TEMP_WARNING_C}°C`, penalty: `-${HEALTH.PENALTY_WARNING}`, severity: 'warning' },
                    { rule: 'Vehicle Offline', penalty: `-${HEALTH.PENALTY_CRITICAL}`, severity: 'critical' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg text-sm">
                      <span>{r.rule}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-red-400">{r.penalty}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.severity === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>{r.severity}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Base score: {HEALTH.BASE_SCORE} | HEALTHY ≥ 80 | DEGRADED 50–79 | CRITICAL &lt; 50
                </div>
              </div>

              {/* About */}
              <div className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/[0.02] border border-primary/20 p-6">
                <h2 className="text-lg font-medium mb-4 text-primary">About Axion</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Version:</strong> 1.2.0</p>
                  <p><strong className="text-foreground">Stack:</strong> React 18 + Spring Boot 3.2 + Kafka + Redis</p>
                  <p><strong className="text-foreground">Architecture:</strong> Event-driven Digital Twin pipeline</p>
                  <p><strong className="text-foreground">Protocols:</strong> REST + MQTT dual ingestion</p>
                  <p className="pt-2 text-xs text-muted-foreground/70">EV Fleet Management Platform — Minor Project</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'landing':
      case 'architecture':
        // These are handled at the top level, but if they somehow get here, 
        // we'll just show the dashboard or could redirect back.
        return <FleetDashboard />;
      default:
        return <FleetDashboard />;
    }
  };

  return (
    <>
      <Toaster theme="dark" position="top-right" richColors closeButton />
      <Layout
        currentPage={currentPage as any}
        onNavigate={setCurrentPage as any}
        onSearch={(query) => {
          setSelectedVehicleId(query);
          setCurrentPage('digital-twin');
        }}
        onBackToLanding={onBackToLanding}
      >
        {renderPage()}
      </Layout>
    </>
  );
}

export default function App() {
  const { user } = useAuth();
  const [view, setView] = useState<AuthPage | Page>('landing');

  // Handle "Get Started" logic based on auth status
  const handleGetStarted = () => {
    if (user) {
      setView('dashboard');
    } else {
      setView('signup');
    }
  };

  // If user is not logged in, we only allow auth-related views + landing
  if (!user) {
    switch (view) {
      case 'landing':
        return (
          <LandingPage 
            onGetStarted={handleGetStarted} 
            onViewArchitecture={() => setView('architecture')} 
          />
        );
      case 'architecture':
        return <ArchitecturePage onBack={() => setView('landing')} />;
      case 'login':
        return (
          <LoginPage 
            onSwitchToSignup={() => setView('signup')} 
            onBackToLanding={() => setView('landing')}
          />
        );
      case 'signup':
        return (
          <SignupPage 
            onSwitchToLogin={() => setView('login')} 
            onBackToLanding={() => setView('landing')}
          />
        );
      default:
        return (
          <LandingPage 
            onGetStarted={handleGetStarted} 
            onViewArchitecture={() => setView('architecture')} 
          />
        );
    }
  }

  // If user is logged in
  if (view === 'landing') {
    return (
      <LandingPage 
        onGetStarted={handleGetStarted} 
        onViewArchitecture={() => setView('architecture')} 
      />
    );
  }

  if (view === 'architecture') {
    return <ArchitecturePage onBack={() => setView('landing')} />;
  }

  // Otherwise show the authenticated app
  return (
    <AuthenticatedApp 
      onBackToLanding={() => setView('landing')} 
      initialPage={view as Page} 
    />
  );
}

export function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
