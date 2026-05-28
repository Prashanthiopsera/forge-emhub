import { useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import {
  navItemsForRole,
  roleCanAccessRoute,
  roleHasPermission,
  type PermissionAction,
} from '@/features/auth/permissions';
import type { AppRole } from '@/types/database.types';

/** Dev: console. Prod: structured console for log shipping until WO-034 server audit. */
function logUnauthorizedAccess(path: string, role: AppRole | null) {
  const payload = { event: 'unauthorized_route_access', path, role, at: new Date().toISOString() };
  if (import.meta.env.DEV) {
    console.warn('[RBAC] Unauthorized route access', payload);
  } else {
    console.error('[RBAC-AUDIT]', JSON.stringify(payload));
  }
}

export function usePermissions() {
  const { role } = useAuth();

  const isRole = useCallback((expected: AppRole) => role === expected, [role]);

  const canAccess = useCallback(
    (resource: string) => roleCanAccessRoute(role, resource),
    [role],
  );

  const hasPermission = useCallback(
    (action: PermissionAction) => roleHasPermission(role, action),
    [role],
  );

  const navigationItems = useMemo(() => navItemsForRole(role), [role]);

  const logDenied = useCallback((path: string) => logUnauthorizedAccess(path, role), [role]);

  return {
    role,
    isRole,
    canAccess,
    hasPermission,
    navigationItems,
    logDenied,
  };
}
