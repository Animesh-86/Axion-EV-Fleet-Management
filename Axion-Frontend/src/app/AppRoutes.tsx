import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { FleetDashboard } from '../components/dashboard/FleetDashboard';
import { VehicleList } from '../components/vehicle/VehicleList';
import { OTAManagement } from '../components/ota/OTAManagement';
import { AddVehicleForm } from '../components/admin/AddVehicleForm';
import { Analytics } from '../components/analytics/Analytics';
import { AlertsAnalytics } from '../components/alerts/AlertsAnalytics';
import { SystemHealth } from '../components/system/SystemHealth';
import { LoginPage } from '../components/auth/LoginPage';
import { SignupPage } from '../components/auth/SignupPage';
import { LandingPage } from './pages/LandingPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { SettingsPage } from './pages/SettingsPage';
import { VehicleTwinPage } from './pages/VehicleTwinPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { AppShellLayout } from './layouts/AppShellLayout';
import { AuthRequired } from './guards/AuthRequired';
import { GuestOnly } from './guards/GuestOnly';
import { paths } from '../constants/navigation';

export function AppRoutes() {
  return (
    <>
      <Toaster theme="dark" position="top-right" richColors closeButton />
      <Routes>
        <Route path={paths.landing} element={<LandingPage />} />
        <Route path={paths.architecture} element={<ArchitecturePage />} />
        <Route
          path={paths.login}
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />
        <Route
          path={paths.signup}
          element={
            <GuestOnly>
              <SignupPage />
            </GuestOnly>
          }
        />

        <Route element={<AuthRequired />}>
          <Route element={<AppShellLayout />}>
            <Route path={paths.dashboard} element={<FleetDashboard />} />
            <Route path={paths.vehicles} element={<VehicleList />} />
            <Route path={paths.adminAddVehicle} element={<AddVehicleForm />} />
            <Route path="/vehicles/:vehicleId" element={<VehicleTwinPage />} />
            <Route path={paths.ota} element={<OTAManagement />} />
            <Route path={paths.analytics} element={<Analytics />} />
            <Route path={paths.alerts} element={<AlertsAnalytics />} />
            <Route path={paths.system} element={<SystemHealth />} />
            <Route path={paths.auditLogs} element={<AuditLogsPage />} />
            <Route path={paths.settings} element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={paths.landing} replace />} />
      </Routes>
    </>
  );
}
