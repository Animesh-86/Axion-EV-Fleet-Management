import { Outlet } from 'react-router-dom';
import { Layout } from '../../components/Layout';

/**
 * Main application shell layout.
 * All dashboard routes are nested under this layout.
 */
export function AppShellLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
