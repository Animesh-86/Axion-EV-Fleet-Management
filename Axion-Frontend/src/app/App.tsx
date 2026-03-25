import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import { ThemeProvider } from '../hooks/useTheme';
import { AuthProvider } from '../services/auth';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Toaster theme="dark" position="top-right" richColors closeButton />
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  );
}
