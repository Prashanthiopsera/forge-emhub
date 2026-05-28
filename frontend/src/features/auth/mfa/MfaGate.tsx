import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { mfaRedirectPath, resolveMfaStatus } from '@/features/auth/mfa/mfaStatus';

/**
 * Blocks protected app routes until HR Admin completes MFA enrollment or verification.
 */
export function MfaGate() {
  const { role } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const status = await resolveMfaStatus(role);
        if (cancelled) return;
        setRedirectTo(mfaRedirectPath(status));
      } catch {
        if (!cancelled) {
          setRedirectTo('/login');
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [role]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-600">
        Checking MFA…
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
