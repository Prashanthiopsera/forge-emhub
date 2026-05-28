import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { buildTeamProgressFixture, MORGAN_MANAGER_ID } from '@/features/manager/manager.fixtures';
import {
  buildDirectReportProgress,
  sortReportsByProgress,
  type ReportTaskRow,
} from '@/features/manager/manager.logic';
import type { TeamProgressData } from '@/features/manager/manager.types';
import { getSupabase } from '@/lib/supabase';

export { MORGAN_MANAGER_ID };

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  job_title: string | null;
}

export async function fetchTeamProgressFromSupabase(
  managerId: string,
): Promise<TeamProgressData | null> {
  const supabase = getSupabase();

  const { data: reports, error: reportsError } = await supabase
    .from('profiles')
    .select('id, full_name, email, job_title')
    .eq('manager_id', managerId)
    .is('deleted_at', null);

  if (reportsError || !reports) return null;

  const reportRows = reports as ProfileRow[];
  if (reportRows.length === 0) {
    return { reports: [], source: 'supabase' };
  }

  const reportIds = reportRows.map((row) => row.id);
  const { data: taskRows, error: taskError } = await supabase
    .from('task_progress')
    .select('user_id, status, due_at, template_tasks(title, phase_name, sort_order)')
    .in('user_id', reportIds);

  if (taskError || !taskRows) return null;

  const tasksByUser = new Map<string, ReportTaskRow[]>();
  for (const row of taskRows as (ReportTaskRow & { user_id: string })[]) {
    const list = tasksByUser.get(row.user_id) ?? [];
    list.push(row);
    tasksByUser.set(row.user_id, list);
  }

  const progress = reportRows.map((profile) =>
    buildDirectReportProgress(profile, tasksByUser.get(profile.id) ?? []),
  );

  return {
    reports: sortReportsByProgress(progress),
    source: 'supabase',
  };
}

export function useTeamProgress() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<TeamProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (managerId: string) => {
    setLoading(true);
    setError(null);

    try {
      const remote = await fetchTeamProgressFromSupabase(managerId);
      if (remote) {
        setData(remote);
        return;
      }
      setData(buildTeamProgressFixture(managerId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load team progress';
      setError(message);
      setData(buildTeamProgressFixture(managerId));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) {
      setData(null);
      setLoading(false);
      return;
    }
    void load(user.id);
  }, [authLoading, user?.id, load]);

  return { data, loading: authLoading || loading, error };
}
