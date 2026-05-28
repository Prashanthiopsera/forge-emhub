import { describe, expect, it } from 'vitest';
import { roleRequiresMfa } from './requiresMfa';

describe('roleRequiresMfa', () => {
  it('requires MFA only for hr_admin', () => {
    expect(roleRequiresMfa('hr_admin')).toBe(true);
    expect(roleRequiresMfa('employee')).toBe(false);
    expect(roleRequiresMfa('manager')).toBe(false);
    expect(roleRequiresMfa('it_ops')).toBe(false);
    expect(roleRequiresMfa(null)).toBe(false);
  });
});
