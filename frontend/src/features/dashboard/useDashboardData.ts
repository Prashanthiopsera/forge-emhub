import { useCallback, useEffect, useState } from 'react';
import { buildDashboardFixture } from '@/features/dashboard/dashboard.fixtures';
import {
  computeCurrentPhase,
  computeProgressPercent,
  selectNextActions,
} from '@/features/dashboard/dashboard.logic';
import type { DashboardData, DashboardTask, TaskStatus } from '@/features/dashboard/dashboard.types';
import { useAuth } from '@/features/auth/AuthContext';
import type { AppRole } from '@/types/database.types';
import { getSupabase } from '@/lib/supabase';

interface ProfileRow {
  full_name: string;
  job_title: string | null;
  start_date: string | null;
  role: AppRole;
  departments: { name: string } | { name: string }[] | null;
}

interface TaskProgressRow {
  id: string;
  status: TaskStatus;
  template_tasks:
    | { title: string; phase_name: string; sort_order: number }
    | { title: string; phase_name: string; sort_order: number }[]
    | null;
}

function mapTasks(rows: TaskProgressRow[]): DashboardTask[] {
  return rows.map((row) => {
    const templateTask = Array.isArray(row.template_tasks)
      ? row.template_tasks[0]
      : row.template_tasks;

    return {
      id: row.id,
      title: templateTask?.title ?? 'Onboarding task',
      phaseName: templateTask?.phase_name ?? 'Week 1',
      status: row.status,
      sortOrder: templateTask?.sort_order ?? 0,
    };
  });
}

function mapProfile(row: ProfileRow): DashboardData['profile'] {
  const department = Array.isArray(row.departments) ? row.departments[0] : row.departments;

  return {
    fullName: row.full_name,
    jobTitle: row.job_title,
    departmentName: department?.name ?? null,
    role: row.role,
    startDate: row.start_date,
  };
}

function buildDashboardData(
  profile: DashboardData['profile'],
  tasks: DashboardTask[],
  source: DashboardData['source'],
): DashboardData {
  return {
    profile,
    tasks,
    progressPercent: computeProgressPercent(tasks),
    currentPhase: computeCurrentPhase(tasks),
    nextActions: selectNextActions(tasks),
    source,
  };
}

export async function fetchDashboardFromSupabase(userId: string): Promise<DashboardData | null> {
  const supabase = getSupabase();

  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, job_title, start_date, role, departments(name)')
    .eq('id', userId)
    .maybeSingle();

  if (profileError || !profileRow) return null;

  const { data: taskRows, error: taskError } = await supabase
    .from('task_progress')
    .select('id, status, template_tasks(title, phase_name, sort_order)')
    .eq('user_id', userId);

  if (taskError || !taskRows) return null;

  const tasks = mapTasks(taskRows as TaskProgressRow[]);
  return buildDashboardData(mapProfile(profileRow as ProfileRow), tasks, 'supabase');
}

export function useDashboardData() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const remote = await fetchDashboardFromSupabase(userId);
      if (remote) {
        setData(remote);
        return;
      }
      setData(buildDashboardFixture(userId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(message);
      setData(buildDashboardFixture(userId));
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
