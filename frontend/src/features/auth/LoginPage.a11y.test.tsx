import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { axe } from '@/test/a11y';
import { LoginPage } from '@/features/auth/LoginPage';

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({ signIn: vi.fn() }),
}));

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    auth: { getSession: async () => ({ data: { session: null } }) },
  }),
}));

describe('LoginPage a11y (WO-036)', () => {
  it('has no serious accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
