import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '@/features/auth/AuthContext';
import { MfaGate } from './MfaGate';

const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockListFactors = vi.fn();
const mockGetAal = vi.fn();

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
      mfa: {
        listFactors: mockListFactors,
        getAuthenticatorAssuranceLevel: mockGetAal,
      },
    },
  }),
}));

function hrAdminSession() {
  return {
    access_token: 'hdr.' + btoa(JSON.stringify({ role: 'hr_admin' })) + '.sig',
    user: { id: 'hr-1', email: 'hr.programs@emhub.local', app_metadata: {}, user_metadata: {} },
  };
}

describe('MfaGate (WO-010)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockGetSession.mockResolvedValue({ data: { session: hrAdminSession() } });
  });

  it('redirects HR Admin without MFA to enroll', async () => {
    mockListFactors.mockResolvedValue({
      data: { totp: [], phone: [] },
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route element={<MfaGate />}>
              <Route path="/dashboard" element={<p>Dashboard</p>} />
            </Route>
            <Route path="/mfa/enroll" element={<p>Enroll MFA</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Enroll MFA')).toBeInTheDocument();
  });

  it('allows HR Admin through when MFA is complete', async () => {
    mockListFactors.mockResolvedValue({
      data: { totp: [{ id: 'f1', status: 'verified' }], phone: [] },
      error: null,
    });
    mockGetAal.mockResolvedValue({
      data: { currentLevel: 'aal2', nextLevel: 'aal2' },
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route element={<MfaGate />}>
              <Route path="/dashboard" element={<p>Dashboard</p>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });

  it('does not block employees', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'hdr.' + btoa(JSON.stringify({ role: 'employee' })) + '.sig',
          user: { id: 'e1', email: 'e@emhub.local', app_metadata: {}, user_metadata: {} },
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route element={<MfaGate />}>
              <Route path="/dashboard" element={<p>Dashboard</p>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(mockListFactors).not.toHaveBeenCalled();
  });
});
