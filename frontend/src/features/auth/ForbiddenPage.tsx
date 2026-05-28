import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { usePermissions } from '@/features/auth/usePermissions';

export function ForbiddenPage() {
  const location = useLocation();
  const { logDenied, role } = usePermissions();

  useEffect(() => {
    logDenied(location.pathname);
  }, [location.pathname, logDenied]);

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-red-600">403 Forbidden</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Access denied</h1>
      <p className="mt-3 text-sm text-slate-600">
        Your role{role ? ` (${role.replace('_', ' ')})` : ''} does not have permission to view this
        page.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
