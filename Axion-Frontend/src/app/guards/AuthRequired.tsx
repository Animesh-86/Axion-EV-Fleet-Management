import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../services/auth';

export function AuthRequired() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
