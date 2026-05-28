import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePermissions } from '@/features/auth/usePermissions';

/** Blocks routes when JWT role cannot access the path (WO-009). */
export function RoleRestrictedRoute({ path }: { path: string }) {
  const { canAccess } = usePermissions();
  const location = useLocation();

  if (!canAccess(path)) {
    return <Navigate to="/forbidden" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
