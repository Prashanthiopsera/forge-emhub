import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthProvider } from './AuthContext';
import { RoleRestrictedRoute } from './RoleRestrictedRoute';

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

describe('RoleRestrictedRoute (WO-009)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('redirects employee from /admin to forbidden', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'hdr.' + btoa(JSON.stringify({ role: 'employee' })) + '.sig',
          user: { id: 'u1', email: 'a@b.com', app_metadata: {}, user_metadata: {} },
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <Routes>
            <Route path="/forbidden" element={<h1>Forbidden</h1>} />
            <Route element={<RoleRestrictedRoute path="/admin" />}>
              <Route path="/admin" element={<h1>Admin</h1>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Forbidden' })).toBeInTheDocument();
  });
});
