import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import {
  IT_OPS_FIXTURE_NOTIFICATIONS,
} from '@/features/provisioning/provisioning.fixtures';
import {
  filterProvisioningTasks,
  sortProvisioningTasks,
} from '@/features/provisioning/provisioning.logic';
import {
  mapNotificationRow,
} from '@/features/notifications/notifications.logic';
import type { InAppNotification, NotificationRow } from '@/features/notifications/notification.types';
import { getSupabase } from '@/lib/supabase';

export async function fetchItProvisioningTasks(): Promise<InAppNotification[] | null> {
  const { data, error } = await getSupabase()
    .from('notifications')
    .select('id, user_id, channel, target_role, status, payload, created_at')
    .or('target_role.eq.it_ops,payload->>type.eq.provisioning')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) return null;

  return (data as NotificationRow[]).map(mapNotificationRow);
}

export async function markProvisioningTaskDone(notificationId: string): Promise<Error | null> {
  const { error } = await getSupabase()
    .from('notifications')
    .update({ status: 'read' })
    .eq('id', notificationId);

  return error ? new Error(error.message) : null;
}

export function useProvisioning() {
  const { role } = useAuth();
  const [tasks, setTasks] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'fixture'>('fixture');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const remote = await fetchItProvisioningTasks();
      if (remote) {
        setTasks(sortProvisioningTasks(filterProvisioningTasks(remote)));
        setSource('supabase');
        return;
      }
      setTasks(sortProvisioningTasks(IT_OPS_FIXTURE_NOTIFICATIONS));
      setSource('fixture');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load provisioning tasks');
      setTasks(sortProvisioningTasks(IT_OPS_FIXTURE_NOTIFICATIONS));
      setSource('fixture');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role !== 'it_ops' && role !== 'hr_admin') {
      setTasks([]);
      setLoading(false);
      return;
    }
    void load();
  }, [role, load]);

  const markDone = useCallback(
    async (notificationId: string) => {
      setTasks((current) =>
        current.map((task) =>
          task.id === notificationId ? { ...task, status: 'read', read: true } : task,
        ),
      );
      if (source === 'supabase') {
        const updateError = await markProvisioningTaskDone(notificationId);
        if (updateError) {
          setError(updateError.message);
          void load();
        }
      }
    },
    [source, load],
  );

  const pendingCount = tasks.filter((task) => !task.read).length;

  return { tasks, pendingCount, loading, error, source, markDone, reload: load };
}
