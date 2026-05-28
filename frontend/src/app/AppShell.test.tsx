import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '@/features/auth/AuthContext';
import { AppShell } from './AppShell';

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'hdr.' + btoa(JSON.stringify({ role: 'hr_admin' })) + '.sig',
            user: { id: 'u1', email: 'hr.admin@emhub.local', app_metadata: {}, user_metadata: {} },
          },
        },
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
    from: (table: string) => {
      if (table === 'notifications') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => ({
                  limit: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    },
    channel: () => ({
      on: () => ({ subscribe: vi.fn() }),
    }),
    removeChannel: vi.fn(),
  }),
}));

describe('AppShell', () => {
  it('renders main navigation links', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Admin' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });
});
