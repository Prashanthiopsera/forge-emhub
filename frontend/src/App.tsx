import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/app/routes';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
