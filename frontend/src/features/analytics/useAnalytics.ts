import { useCallback, useEffect, useState } from 'react';
import { buildAnalyticsFixture } from '@/features/analytics/analytics.fixtures';
import {
  buildAnalyticsMetrics,
  buildDepartmentMetrics,
  type AnalyticsProfileRow,
  type AnalyticsTaskRow,
} from '@/features/analytics/analytics.logic';
import type { AnalyticsData } from '@/features/analytics/analytics.types';
import { getSupabase } from '@/lib/supabase';

export async function fetchAnalyticsFromSupabase(): Promise<AnalyticsData | null> {
  const supabase = getSupabase();

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, departments(name)')
    .eq('role', 'employee')
    .is('deleted_at', null);

  if (profileError || !profiles) return null;

  const employeeRows = profiles as AnalyticsProfileRow[];
  const employeeIds = employeeRows.map((row) => row.id);

  if (employeeIds.length === 0) {
    return {
      metrics: {
        activeOnboarding: 0,
        avgCompletionPercent: 0,
        overdueTasks: 0,
        completedThisMonth: 0,
      },
      byDepartment: [],
      source: 'supabase',
    };
  }

  const { data: taskRows, error: taskError } = await supabase
    .from('task_progress')
    .select('user_id, status, due_at, completed_at, template_tasks(title, phase_name, sort_order)')
    .in('user_id', employeeIds);

  if (taskError || !taskRows) return null;

  const tasks = taskRows as AnalyticsTaskRow[];

  return {
    metrics: buildAnalyticsMetrics(employeeRows, tasks),
    byDepartment: buildDepartmentMetrics(employeeRows, tasks),
    source: 'supabase',
  };
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const remote = await fetchAnalyticsFromSupabase();
      if (remote) {
        setData(remote);
        return;
      }
      setData(buildAnalyticsFixture());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load analytics';
      setError(message);
      setData(buildAnalyticsFixture());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error };
}
