import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { buildChecklistFixture } from '@/features/checklist/checklist.fixtures';
import {
  computeChecklistProgressPercent,
  groupTasksByPhase,
  mapRowToChecklistTask,
} from '@/features/checklist/checklist.logic';
import type { ChecklistData, ChecklistTask } from '@/features/checklist/checklist.types';
import { getSupabase } from '@/lib/supabase';

interface TaskProgressRow {
  id: string;
  status: ChecklistTask['status'];
  due_at: string | null;
  completed_at: string | null;
  template_tasks:
    | { title: string; phase_name: string; sort_order: number }
    | { title: string; phase_name: string; sort_order: number }[]
    | null;
}

function buildChecklistData(tasks: ChecklistTask[], source: ChecklistData['source']): ChecklistData {
  return {
    tasks,
    phaseGroups: groupTasksByPhase(tasks),
    progressPercent: computeChecklistProgressPercent(tasks),
    source,
  };
}

export async function fetchChecklistFromSupabase(userId: string): Promise<ChecklistData | null> {
  const supabase = getSupabase();

  const { data: rows, error } = await supabase
    .from('task_progress')
    .select('id, status, due_at, completed_at, template_tasks(title, phase_name, sort_order)')
    .eq('user_id', userId);

  if (error || !rows) return null;

  const tasks = (rows as TaskProgressRow[]).map(mapRowToChecklistTask);
  return buildChecklistData(tasks, 'supabase');
}

export async function markTaskCompleteInSupabase(
  userId: string,
  taskId: string,
): Promise<{ error: string | null }> {
  const supabase = getSupabase();
  const completedAt = new Date().toISOString();

  const { error } = await supabase
    .from('task_progress')
    .update({ status: 'completed', completed_at: completedAt })
    .eq('id', taskId)
    .eq('user_id', userId);

  return { error: error?.message ?? null };
}

export function useChecklist() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<ChecklistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const load = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const remote = await fetchChecklistFromSupabase(userId);
      if (remote) {
        setData(remote);
        return;
      }
      setData(buildChecklistFixture(userId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load checklist';
      setError(message);
      setData(buildChecklistFixture(userId));
    } finally {
      setLoading(false);
    }
  }, []);

  const markComplete = useCallback(
    async (taskId: string) => {
      if (!user?.id) return;

      const previous = data;
      if (previous) {
        const optimistic = previous.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: 'completed' as const,
                completedAt: new Date().toISOString(),
              }
            : task,
        );
        setData(buildChecklistData(optimistic, previous.source));
      }

      setCompletingId(taskId);

      try {
        const { error: updateError } = await markTaskCompleteInSupabase(user.id, taskId);
        if (updateError) {
          setError(updateError);
          if (previous) setData(previous);
          return;
        }

        if (previous?.source === 'fixture') {
          await load(user.id);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to complete task';
        setError(message);
        if (previous) setData(previous);
      } finally {
        setCompletingId(null);
      }
    },
    [data, load, user?.id],
  );

  useEffect(() => {
    if (authLoading) return;

    if (!user?.id) {
      setData(null);
      setLoading(false);
      return;
    }

    void load(user.id);
  }, [authLoading, user?.id, load]);

  useEffect(() => {
    if (!user?.id) return;

    const supabase = getSupabase();
    const channel = supabase
      .channel(`task_progress:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_progress',
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
  }, [user?.id, load]);

  return {
    data,
    loading: authLoading || loading,
    error,
    completingId,
    markComplete,
  };
}
