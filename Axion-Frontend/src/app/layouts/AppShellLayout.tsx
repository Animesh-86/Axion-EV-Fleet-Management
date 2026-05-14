import { Outlet } from 'react-router-dom';
import { Layout } from '../../components/Layout';

export function AppShellLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
