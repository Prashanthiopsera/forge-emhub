import type { AppRole } from '@/types/database.types';

export type NavItem = {
  to: string;
  label: string;
  roles: readonly AppRole[];
};

/** Route → roles allowed (WO-009). */
export const ROUTE_ROLES: Record<string, readonly AppRole[]> = {
  '/dashboard': ['employee', 'manager', 'hr_admin', 'it_ops'],
  '/checklist': ['employee', 'manager', 'hr_admin', 'it_ops'],
  '/training': ['employee', 'manager', 'hr_admin', 'it_ops'],
  '/org-chart': ['employee', 'manager', 'hr_admin', 'it_ops'],
  '/faq': ['employee', 'manager', 'hr_admin', 'it_ops'],
  '/chatbot': ['employee', 'manager', 'hr_admin', 'it_ops'],
  '/team-progress': ['manager', 'hr_admin'],
  '/admin': ['hr_admin'],
  '/analytics': ['hr_admin'],
  '/provisioning': ['it_ops', 'hr_admin'],
};

export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', roles: ROUTE_ROLES['/dashboard'] },
  { to: '/checklist', label: 'Checklist', roles: ROUTE_ROLES['/checklist'] },
  { to: '/training', label: 'Training', roles: ROUTE_ROLES['/training'] },
  { to: '/org-chart', label: 'Org Chart', roles: ROUTE_ROLES['/org-chart'] },
  { to: '/faq', label: 'FAQ', roles: ROUTE_ROLES['/faq'] },
  { to: '/chatbot', label: 'Chatbot', roles: ROUTE_ROLES['/chatbot'] },
  { to: '/team-progress', label: 'Team Progress', roles: ROUTE_ROLES['/team-progress'] },
  { to: '/provisioning', label: 'Provisioning Tasks', roles: ROUTE_ROLES['/provisioning'] },
  { to: '/admin', label: 'Admin', roles: ROUTE_ROLES['/admin'] },
  { to: '/analytics', label: 'Analytics', roles: ROUTE_ROLES['/analytics'] },
] as const;

export type PermissionAction =
  | 'view_own_onboarding'
  | 'view_team_progress'
  | 'manage_content'
  | 'view_analytics'
  | 'manage_provisioning';

const ACTION_ROLES: Record<PermissionAction, readonly AppRole[]> = {
  view_own_onboarding: ['employee', 'manager', 'hr_admin', 'it_ops'],
  view_team_progress: ['manager', 'hr_admin'],
  manage_content: ['hr_admin'],
  view_analytics: ['hr_admin'],
  manage_provisioning: ['it_ops', 'hr_admin'],
};

export function roleCanAccessRoute(role: AppRole | null, path: string): boolean {
  if (!role) return false;
  const allowed = ROUTE_ROLES[path];
  if (!allowed) return true;
  return allowed.includes(role);
}

export function roleHasPermission(role: AppRole | null, action: PermissionAction): boolean {
  if (!role) return false;
  return ACTION_ROLES[action].includes(role);
}

export function navItemsForRole(role: AppRole | null): NavItem[] {
  if (!role) return [];
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
