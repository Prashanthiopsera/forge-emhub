import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AppShell } from '@/app/AppShell';
import { AuthProvider } from './AuthContext';

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

function renderShellAs(role: string) {
  mockGetSession.mockResolvedValue({
    data: {
      session: {
        access_token: 'hdr.' + btoa(JSON.stringify({ role })) + '.sig',
        user: { id: 'u1', email: 'test@emhub.local', app_metadata: {}, user_metadata: {} },
      },
    },
  });

  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('RBAC navigation (WO-009 integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('employee sees core nav without admin', async () => {
    renderShellAs('employee');
    expect(await screen.findByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
  });

  it('manager sees Team Progress', async () => {
    renderShellAs('manager');
    expect(await screen.findByRole('link', { name: 'Team Progress' })).toBeInTheDocument();
  });

  it('hr_admin sees Admin and Analytics', async () => {
    renderShellAs('hr_admin');
    expect(await screen.findByRole('link', { name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Analytics' })).toBeInTheDocument();
  });

  it('it_ops sees Provisioning Tasks', async () => {
    renderShellAs('it_ops');
    expect(await screen.findByRole('link', { name: 'Provisioning Tasks' })).toBeInTheDocument();
  });
});
