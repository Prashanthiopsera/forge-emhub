import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ALEX_USER_ID, buildTrainingFixture } from '@/features/training/training.fixtures';
import {
  fetchTrainingFromSupabase,
  upsertVideoProgress,
  useTrainingProgress,
} from '@/features/training/useTrainingProgress';

const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockTrainingOrder = vi.fn();
const mockProgressEq = vi.fn();
const mockUpsert = vi.fn();

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
      if (table === 'training_modules') {
        return {
          select: () => ({
            order: mockTrainingOrder,
          }),
        };
      }

      if (table === 'video_progress') {
        return {
          select: () => ({
            eq: () => mockProgressEq(),
          }),
          upsert: mockUpsert,
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

describe('useTrainingProgress (WO-016)', () => {
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

  it('falls back to fixture data when Supabase returns no modules', async () => {
    mockTrainingOrder.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => useTrainingProgress(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.source).toBe('fixture');
    expect(result.current.data?.modules).toHaveLength(5);
    expect(result.current.data?.modules[0].completed).toBe(true);
  });

  it('maps Supabase rows into catalog modules', async () => {
    mockTrainingOrder.mockResolvedValue({
      data: [
        {
          id: 'e1000000-0000-4000-8000-000000000001',
          title: 'Welcome to Our Culture',
          description: 'Culture intro',
          category: 'Company Culture',
          video_provider: 'vimeo',
          video_external_id: '76979871',
          duration_seconds: 600,
          required: true,
        },
      ],
      error: null,
    });
    mockProgressEq.mockResolvedValue({
      data: [
        {
          module_id: 'e1000000-0000-4000-8000-000000000001',
          watched_seconds: 600,
          completed: true,
        },
      ],
      error: null,
    });

    const remote = await fetchTrainingFromSupabase(ALEX_USER_ID);
    expect(remote?.source).toBe('supabase');
    expect(remote?.modules[0].completed).toBe(true);
    expect(remote?.modules[0].watchedSeconds).toBe(600);
  });

  it('upserts video_progress with 90% completion flag', async () => {
    mockUpsert.mockResolvedValue({ error: null });
    const [module] = buildTrainingFixture().modules;

    await upsertVideoProgress(ALEX_USER_ID, module, 540);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        module_id: module.id,
        user_id: ALEX_USER_ID,
        watched_seconds: 540,
        completed: true,
      }),
      { onConflict: 'module_id,user_id' },
    );
  });
});
