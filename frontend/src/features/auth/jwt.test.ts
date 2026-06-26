import { describe, expect, it } from 'vitest';
import type { Session } from '@supabase/supabase-js';
import { decodeJwtPayload, getRoleFromSession } from './jwt';

function fakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.sig`;
}

describe('jwt helpers (WO-008)', () => {
  it('decodes JWT payload', () => {
    const token = fakeJwt({ app_role: 'hr_admin', sub: 'user-1' });
    expect(decodeJwtPayload(token)?.app_role).toBe('hr_admin');
  });

  it('reads role from session access token', () => {
    const session = {
      access_token: fakeJwt({ app_role: 'manager' }),
      user: { id: 'u1', app_metadata: {}, user_metadata: {} },
    } as unknown as Session;
    expect(getRoleFromSession(session)).toBe('manager');
  });

  it('returns null when role claim is missing', () => {
    const session = {
      access_token: fakeJwt({ sub: 'u1' }),
      user: { id: 'u1', app_metadata: {}, user_metadata: {} },
    } as unknown as Session;
    expect(getRoleFromSession(session)).toBeNull();
  });
});
