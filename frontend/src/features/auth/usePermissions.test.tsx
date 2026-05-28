import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthProvider } from './AuthContext';
import { usePermissions } from './usePermissions';

const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
  }),
}));

function sessionWithRole(role: string) {
  return {
    access_token: 'hdr.' + btoa(JSON.stringify({ role })) + '.sig',
    user: { id: 'u1', email: 'u@test.com', app_metadata: {}, user_metadata: {} },
  };
}

describe('usePermissions (WO-009)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  for (const [role, canAdmin, canTeam] of [
    ['employee', false, false],
    ['manager', false, true],
    ['hr_admin', true, true],
    ['it_ops', false, false],
  ] as const) {
    it(`returns correct permissions for ${role}`, async () => {
      mockGetSession.mockResolvedValue({ data: { session: sessionWithRole(role) } });

      const { result } = renderHook(() => usePermissions(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await vi.waitFor(() => expect(result.current.role).toBe(role));
      expect(result.current.isRole(role)).toBe(true);
      expect(result.current.canAccess('/dashboard')).toBe(true);
      expect(result.current.canAccess('/admin')).toBe(canAdmin);
      expect(result.current.canAccess('/team-progress')).toBe(canTeam);
    });
  }
});
