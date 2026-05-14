import { useNavigate, useParams } from 'react-router-dom';
import { VehicleDetail } from '../../components/vehicle/VehicleDetail';
import { paths } from '../../constants/navigation';

export function VehicleTwinPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const id = vehicleId ?? null;

  return (
    <VehicleDetail
      vehicleId={id}
      onBack={() => navigate(paths.vehicles)}
    />
  );
}
