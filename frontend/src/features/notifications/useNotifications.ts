import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { buildNotificationFixtures } from '@/features/notifications/notifications.fixtures';
import {
  countUnread,
  IN_APP_CHANNEL,
  mapNotificationRow,
} from '@/features/notifications/notifications.logic';
import type {
  InAppNotification,
  NotificationRow,
  NotificationSource,
} from '@/features/notifications/notification.types';
import { getSupabase } from '@/lib/supabase';

export async function fetchNotificationsFromSupabase(
  userId: string,
): Promise<InAppNotification[] | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('notifications')
    .select('id, user_id, channel, status, payload, created_at')
    .eq('user_id', userId)
    .eq('channel', IN_APP_CHANNEL)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) return null;

  return (data as NotificationRow[]).map(mapNotificationRow);
}

export async function markNotificationReadInSupabase(
  notificationId: string,
  userId: string,
): Promise<{ error: Error | null }> {
  const { error } = await getSupabase()
    .from('notifications')
    .update({ status: 'read' })
    .eq('id', notificationId)
    .eq('user_id', userId);

  return { error: error ? new Error(error.message) : null };
}

export async function markAllNotificationsReadInSupabase(
  userId: string,
): Promise<{ error: Error | null }> {
  const { error } = await getSupabase()
    .from('notifications')
    .update({ status: 'read' })
    .eq('user_id', userId)
    .eq('channel', IN_APP_CHANNEL)
    .in('status', ['pending', 'sent']);

  return { error: error ? new Error(error.message) : null };
}

export function useNotifications() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [source, setSource] = useState<NotificationSource>('fixture');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const remote = await fetchNotificationsFromSupabase(userId);
      if (remote) {
        setNotifications(remote);
        setSource('supabase');
        return;
      }
      setNotifications(buildNotificationFixtures(userId));
      setSource('fixture');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(message);
      setNotifications(buildNotificationFixtures(userId));
      setSource('fixture');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    void load(user.id);
  }, [authLoading, user?.id, load]);

  useEffect(() => {
    if (!user?.id || source !== 'supabase') return;

    const supabase = getSupabase();
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void load(user.id);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id, source, load]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!user?.id) return;

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, status: 'read', read: true }
            : notification,
        ),
      );

      if (source === 'supabase') {
        const { error: updateError } = await markNotificationReadInSupabase(notificationId, user.id);
        if (updateError) {
          setError(updateError.message);
          void load(user.id);
        }
      }
    },
    [user?.id, source, load],
  );

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    setNotifications((current) =>
      current.map((notification) => ({ ...notification, status: 'read', read: true })),
    );

    if (source === 'supabase') {
      const { error: updateError } = await markAllNotificationsReadInSupabase(user.id);
      if (updateError) {
        setError(updateError.message);
        void load(user.id);
      }
    }
  }, [user?.id, source, load]);

  const unreadCount = useMemo(() => countUnread(notifications), [notifications]);

  return {
    notifications,
    unreadCount,
    loading: authLoading || loading,
    error,
    source,
    markAsRead,
    markAllAsRead,
  };
}
