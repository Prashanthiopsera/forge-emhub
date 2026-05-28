import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { resolvePostAuthPath } from '@/features/auth/mfa/postAuthPath';

export function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-600">
        Loading session…
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

export function PublicAuthRoute({ children }: { children: React.ReactElement }) {
  const { session, role, loading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (!session) {
      setRedirectTo(null);
      setResolving(false);
      return;
    }

    let cancelled = false;
    setResolving(true);

    void resolvePostAuthPath(role, from).then((path) => {
      if (!cancelled) {
        setRedirectTo(path);
        setResolving(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [session, role, from]);

  if (loading || (session && resolving)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-600">
        Loading session…
      </div>
    );
  }

  if (session && redirectTo) {
    return <Navigate to={redirectTo} replace state={{ from }} />;
  }

  return children;
}
