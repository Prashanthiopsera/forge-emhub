import type { Session } from '@supabase/supabase-js';
import type { AppRole } from '@/types/database.types';

const APP_ROLES: readonly AppRole[] = ['employee', 'manager', 'hr_admin', 'it_ops'];

function isAppRole(value: unknown): value is AppRole {
  return typeof value === 'string' && (APP_ROLES as readonly string[]).includes(value);
}

/** Decode JWT payload without verification (client-side display / tests only). */
export function decodeJwtPayload(accessToken: string): Record<string, unknown> | null {
  const parts = accessToken.split('.');
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Read custom `role` claim injected by custom_access_token_hook (WO-008). */
export function getRoleFromSession(session: Session | null): AppRole | null {
  if (!session?.access_token) return null;
  const payload = decodeJwtPayload(session.access_token);
  if (payload && isAppRole(payload.role)) return payload.role;
  const meta = session.user.app_metadata?.role ?? session.user.user_metadata?.role;
  return isAppRole(meta) ? meta : null;
}
