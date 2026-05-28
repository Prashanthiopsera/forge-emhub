import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ALEX_USER_ID } from '@/features/dashboard/dashboard.fixtures';
import {
  fetchNotificationsFromSupabase,
  markNotificationReadInSupabase,
  useNotifications,
} from '@/features/notifications/useNotifications';

const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockNotificationsOrder = vi.fn();
const mockNotificationsUpdate = vi.fn();
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
      if (table === 'notifications') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => ({
                  limit: mockNotificationsOrder,
                }),
              }),
            }),
          }),
          update: () => ({
            eq: () => ({
              eq: mockNotificationsUpdate,
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

describe('useNotifications (WO-030)', () => {
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
    mockChannelSubscribe.mockReturnValue('SUBSCRIBED');
  });

  it('falls back to fixture notifications when Supabase returns no rows', async () => {
    mockNotificationsOrder.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.source).toBe('fixture');
    expect(result.current.unreadCount).toBe(2);
    expect(result.current.notifications[0]?.title).toBe('Welcome to EmHub');
  });

  it('maps Supabase notification rows', async () => {
    mockNotificationsOrder.mockResolvedValue({
      data: [
        {
          id: 'n1',
          user_id: ALEX_USER_ID,
          channel: 'in_app',
          status: 'sent',
          payload: { title: 'Test', body: 'Body', type: 'task' },
          created_at: '2026-05-27T12:00:00.000Z',
        },
      ],
      error: null,
    });

    const remote = await fetchNotificationsFromSupabase(ALEX_USER_ID);
    expect(remote).toHaveLength(1);
    expect(remote?.[0]?.title).toBe('Test');
    expect(remote?.[0]?.read).toBe(false);
  });

  it('subscribes to realtime when using Supabase source', async () => {
    mockNotificationsOrder.mockResolvedValue({
      data: [
        {
          id: 'n1',
          user_id: ALEX_USER_ID,
          channel: 'in_app',
          status: 'sent',
          payload: { title: 'Live', body: 'Update' },
          created_at: '2026-05-27T12:00:00.000Z',
        },
      ],
      error: null,
    });

    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => expect(result.current.source).toBe('supabase'));
    expect(mockChannelOn).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({ table: 'notifications' }),
      expect.any(Function),
    );
    expect(mockChannelSubscribe).toHaveBeenCalled();
  });

  it('marks a notification read in Supabase', async () => {
    mockNotificationsUpdate.mockResolvedValue({ error: null });

    const { error } = await markNotificationReadInSupabase('n1', ALEX_USER_ID);
    expect(error).toBeNull();
  });
});
