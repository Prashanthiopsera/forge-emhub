import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Session } from '@supabase/supabase-js';
import { AuthProvider, useAuth } from './AuthContext';

const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: mockSignInWithPassword,
      signUp: vi.fn(),
      signOut: mockSignOut,
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
  }),
}));

function fakeJwt(role: string) {
  const body = btoa(JSON.stringify({ app_role: role }));
  return `hdr.${body}.sig`;
}

const authenticatedSession = {
  access_token: fakeJwt('employee'),
  user: { id: 'u1', email: 'test@emhub.local', app_metadata: {}, user_metadata: {} },
} as unknown as Session;

describe('useAuth (WO-008)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('starts loading then exposes unauthenticated state', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.session).toBeNull();
    expect(result.current.role).toBeNull();
  });

  it('exposes authenticated session and role claim', async () => {
    mockGetSession.mockResolvedValue({ data: { session: authenticatedSession } });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.session).toBe(authenticatedSession);
    expect(result.current.role).toBe('employee');
  });

  it('signOut clears session via auth client', async () => {
    mockGetSession.mockResolvedValue({ data: { session: authenticatedSession } });
    mockSignOut.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => expect(result.current.session).toBe(authenticatedSession));

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalled();
    expect(result.current.session).toBeNull();
  });
});
