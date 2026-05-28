import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ALEX_USER_ID, buildChecklistFixture } from '@/features/checklist/checklist.fixtures';
import {
  fetchChecklistFromSupabase,
  markTaskCompleteInSupabase,
  useChecklist,
} from '@/features/checklist/useChecklist';

const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockTaskProgressEq = vi.fn();
const mockTaskProgressUpdate = vi.fn();
const mockChannelOn = vi.fn();
const mockChannelSubscribe = vi.fn();
const mockRemoveChannel = vi.fn();

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
      if (table === 'task_progress') {
        return {
          select: () => ({
            eq: () => mockTaskProgressEq(),
          }),
          update: () => ({
            eq: () => ({
              eq: () => mockTaskProgressUpdate(),
            }),
          }),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
    channel: () => ({
      on: (...args: unknown[]) => {
        mockChannelOn(...args);
        return {
          subscribe: mockChannelSubscribe,
        };
      },
    }),
    removeChannel: mockRemoveChannel,
  }),
}));

function fakeJwt(role: string) {
  const body = btoa(JSON.stringify({ role }));
  return `hdr.${body}.sig`;
}

describe('useChecklist (WO-012)', () => {
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
    mockChannelSubscribe.mockReturnValue('subscribed');
  });

  it('falls back to fixture data when Supabase returns no rows', async () => {
    mockTaskProgressEq.mockResolvedValue({ data: null, error: { message: 'network' } });

    const { result } = renderHook(() => useChecklist(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.source).toBe('fixture');
    expect(result.current.data?.phaseGroups).toHaveLength(3);
    expect(mockChannelOn).toHaveBeenCalled();
  });

  it('maps Supabase rows into checklist data', async () => {
    mockTaskProgressEq.mockResolvedValue({
      data: [
        {
          id: 'tp1',
          status: 'completed',
          due_at: '2026-05-01',
          completed_at: '2026-05-02',
          template_tasks: {
            title: 'Complete security training',
            phase_name: 'Day 1',
            sort_order: 1,
          },
        },
      ],
      error: null,
    });

    const remote = await fetchChecklistFromSupabase(ALEX_USER_ID);
    expect(remote?.source).toBe('supabase');
    expect(remote?.progressPercent).toBe(100);
  });

  it('marks a task complete via Supabase update', async () => {
    mockTaskProgressUpdate.mockResolvedValue({ error: null });

    const { error } = await markTaskCompleteInSupabase(ALEX_USER_ID, 'tp1');
    expect(error).toBeNull();
  });

  it('fixture includes overdue Day 1 task', () => {
    const fixture = buildChecklistFixture();
    const overdue = fixture.tasks.find((t) => t.title === 'Meet your manager');
    expect(overdue?.phase).toBe('Day 1');
    expect(fixture.progressPercent).toBe(20);
  });
});
