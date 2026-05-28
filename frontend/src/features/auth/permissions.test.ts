import { describe, expect, it } from 'vitest';
import {
  navItemsForRole,
  roleCanAccessRoute,
  roleHasPermission,
} from './permissions';

describe('permissions (WO-009)', () => {
  it('employee can access core routes but not admin', () => {
    expect(roleCanAccessRoute('employee', '/dashboard')).toBe(true);
    expect(roleCanAccessRoute('employee', '/admin')).toBe(false);
    expect(roleCanAccessRoute('employee', '/team-progress')).toBe(false);
  });

  it('manager can access team progress', () => {
    expect(roleCanAccessRoute('manager', '/team-progress')).toBe(true);
    expect(roleCanAccessRoute('manager', '/admin')).toBe(false);
  });

  it('hr_admin can access admin and analytics', () => {
    expect(roleCanAccessRoute('hr_admin', '/admin')).toBe(true);
    expect(roleCanAccessRoute('hr_admin', '/analytics')).toBe(true);
  });

  it('it_ops can access provisioning', () => {
    expect(roleCanAccessRoute('it_ops', '/provisioning')).toBe(true);
    expect(roleCanAccessRoute('it_ops', '/analytics')).toBe(false);
  });

  it('hasPermission maps actions to roles', () => {
    expect(roleHasPermission('employee', 'view_own_onboarding')).toBe(true);
    expect(roleHasPermission('employee', 'manage_content')).toBe(false);
    expect(roleHasPermission('hr_admin', 'manage_content')).toBe(true);
    expect(roleHasPermission('it_ops', 'manage_provisioning')).toBe(true);
  });

  it('navigation items differ by role', () => {
    const employeeLabels = navItemsForRole('employee').map((i) => i.label);
    const managerLabels = navItemsForRole('manager').map((i) => i.label);
    const hrLabels = navItemsForRole('hr_admin').map((i) => i.label);
    const itLabels = navItemsForRole('it_ops').map((i) => i.label);

    expect(employeeLabels).toContain('Dashboard');
    expect(employeeLabels).not.toContain('Admin');
    expect(managerLabels).toContain('Team Progress');
    expect(hrLabels).toContain('Admin');
    expect(hrLabels).toContain('Analytics');
    expect(itLabels).toContain('Provisioning Tasks');
    expect(itLabels).not.toContain('Analytics');
  });
});
