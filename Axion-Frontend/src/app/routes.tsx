import { createBrowserRouter } from 'react-router';
import { RootLayout } from '../components/RootLayout';
import { LoginPage } from '../components/auth/LoginPage';
import { SignupPage } from '../components/auth/SignupPage';
import { FleetDashboard } from '../components/dashboard/FleetDashboard';
import { VehicleList } from '../components/vehicle/VehicleList';
import { VehicleDetail } from '../components/vehicle/VehicleDetail';
import { OTAManagement } from '../components/ota/OTAManagement';
import { Analytics } from '../components/analytics/Analytics';
import { AlertsAnalytics } from '../components/alerts/AlertsAnalytics';
import { SystemHealth } from '../components/system/SystemHealth';
import { SimulatorPage } from './pages/SimulatorPage';
import { SettingsPage } from './pages/SettingsPage';
import { AccountSettingsPage } from './pages/AccountSettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LandingPage } from './pages/LandingPage';
import { ArchitecturePage } from './pages/ArchitecturePage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LandingPage,
  },
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/signup',
    Component: SignupPage,
  },
  {
    path: '/architecture',
    Component: ArchitecturePage,
  },
  {
    path: '/dashboard',
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: FleetDashboard,
      },
      {
        path: 'fleet',
        Component: VehicleList,
      },
      {
        path: 'digital-twin/:vehicleId?',
        Component: VehicleDetail,
      },
      {
        path: 'ota-campaigns',
        Component: OTAManagement,
      },
      {
        path: 'analytics',
        Component: Analytics,
      },
      {
        path: 'alerts',
        Component: AlertsAnalytics,
      },
      {
        path: 'system',
        Component: SystemHealth,
      },
      {
        path: 'simulator',
        Component: SimulatorPage,
      },
      {
        path: 'settings',
        Component: SettingsPage,
      },
      {
        path: 'account-settings',
        Component: AccountSettingsPage,
      },
    ],
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
]);
