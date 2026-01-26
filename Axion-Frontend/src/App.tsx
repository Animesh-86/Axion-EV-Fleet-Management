import { useState } from 'react';
import { Layout } from './components/Layout';
import { FleetDashboard } from './components/dashboard/FleetDashboard';
import { VehicleList } from './components/vehicle/VehicleList';
import { VehicleDetail } from './components/vehicle/VehicleDetail';
import { OTAManagement } from './components/ota/OTAManagement';
import { Analytics } from './components/analytics/Analytics';

type Page = 'dashboard' | 'fleet' | 'vehicles' | 'digital-twin' | 'ota' | 'analytics' | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <FleetDashboard />;
      case 'fleet':
        return <VehicleList onSelectVehicle={(id) => {
          setSelectedVehicleId(id);
          setCurrentPage('digital-twin');
        }} />;
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
      case 'settings':
        return (
          <div className="p-8">
            <div className="max-w-4xl">
              <h1 className="text-2xl font-semibold mb-4">Settings</h1>
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Settings module - Coming soon</p>
              </div>
            </div>
          </div>
        );
      default:
        return <FleetDashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}
