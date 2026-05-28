import type { AppRole } from '@/types/database.types';

/** HR Admin accounts must enroll and verify TOTP (WO-010). */
export function roleRequiresMfa(role: AppRole | null): boolean {
  return role === 'hr_admin';
}
