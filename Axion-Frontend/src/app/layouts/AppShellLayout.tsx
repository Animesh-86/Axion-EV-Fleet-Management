import { Outlet, Navigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../services/auth';
import { paths } from '../../constants/navigation';

/**
 * Protected route wrapper — redirects to login if the user is not authenticated.
 * All dashboard routes are nested under this layout.
 */
export function AppShellLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={paths.login} replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
