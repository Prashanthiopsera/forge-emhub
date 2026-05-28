import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

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

describe('ProtectedRoute (WO-008)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('redirects unauthenticated users to login', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<p>Login page</p>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<p>Dashboard</p>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Login page')).toBeInTheDocument();
  });

  it('renders child route when session exists', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'hdr.' + btoa(JSON.stringify({ role: 'employee' })) + '.sig',
          user: { id: 'u1', email: 'a@b.com', app_metadata: {}, user_metadata: {} },
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<p>Login page</p>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<p>Dashboard</p>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });
});
