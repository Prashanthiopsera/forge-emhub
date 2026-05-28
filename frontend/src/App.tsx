import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/app/routes';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
