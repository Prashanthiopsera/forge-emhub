import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ALEX_USER_ID, buildDashboardFixture } from '@/features/dashboard/dashboard.fixtures';
import { fetchDashboardFromSupabase, useDashboardData } from '@/features/dashboard/useDashboardData';

const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockProfileMaybeSingle = vi.fn();
const mockTaskProgressEq = vi.fn();

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
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: mockProfileMaybeSingle,
            }),
          }),
        };
      }

      if (table === 'task_progress') {
        return {
          select: () => ({
            eq: () => mockTaskProgressEq(),
          }),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  }),
}));

function fakeJwt(role: string) {
  const body = btoa(JSON.stringify({ app_role: role }));
  return `hdr.${body}.sig`;
}

describe('useDashboardData (WO-011)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: fakeJwt('employee'),
          user: { id: ALEX_USER_ID, email: 'alex.newhire@emhub.local' },
        },
      },
    });
  });

  it('falls back to fixture data when Supabase returns no profile', async () => {
    mockProfileMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockTaskProgressEq.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => useDashboardData(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.source).toBe('fixture');
    expect(result.current.data?.profile.fullName).toBe('Alex Chen');
    expect(result.current.data?.nextActions).toHaveLength(2);
  });

  it('maps Supabase rows into dashboard data', async () => {
    mockProfileMaybeSingle.mockResolvedValue({
      data: {
        full_name: 'Alex Chen',
        job_title: 'Software Engineer',
        start_date: '2026-05-20',
        role: 'employee',
        departments: { name: 'Platform' },
      },
      error: null,
    });
    mockTaskProgressEq.mockResolvedValue({
      data: [
        {
          id: 'tp1',
          status: 'completed',
          template_tasks: {
            title: 'Complete security training',
            phase_name: 'Day 1',
            sort_order: 1,
          },
        },
      ],
      error: null,
    });

    const remote = await fetchDashboardFromSupabase(ALEX_USER_ID);
    expect(remote?.source).toBe('supabase');
    expect(remote?.progressPercent).toBe(100);
    expect(remote?.profile.departmentName).toBe('Platform');
  });

  it('fixture matches Alex seed scenario', () => {
    const fixture = buildDashboardFixture();
    expect(fixture.currentPhase).toBe('Day 1');
    expect(fixture.progressPercent).toBe(33);
    expect(fixture.nextActions.map((task) => task.title)).toEqual([
      'Meet your manager',
      'Set up development environment',
    ]);
  });
});
