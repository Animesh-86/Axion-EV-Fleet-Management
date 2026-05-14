import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './services/auth';
import { AppRoutes } from './app/AppRoutes';

export function AppWithAuth() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
