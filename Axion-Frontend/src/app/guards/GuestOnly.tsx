import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../../services/auth';
import { paths } from '../../constants/navigation';

export function GuestOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to={paths.dashboard} replace />;
  return <>{children}</>;
}
