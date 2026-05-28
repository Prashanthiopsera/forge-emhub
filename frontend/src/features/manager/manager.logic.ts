import { computeProgressPercent, normalizePhase } from '@/features/dashboard/dashboard.logic';
import type { DashboardTask, TaskStatus } from '@/features/dashboard/dashboard.types';
import type { DirectReportProgress } from '@/features/manager/manager.types';

export interface ReportTaskRow {
  status: TaskStatus;
  due_at: string | null;
  template_tasks:
    | { title: string; phase_name: string; sort_order: number }
    | { title: string; phase_name: string; sort_order: number }[]
    | null;
}

export function mapReportTasks(rows: ReportTaskRow[]): DashboardTask[] {
  return rows.map((row) => {
    const templateTask = Array.isArray(row.template_tasks)
      ? row.template_tasks[0]
      : row.template_tasks;

    return {
      id: '',
      title: templateTask?.title ?? 'Task',
      phaseName: templateTask?.phase_name ?? 'Week 1',
      status: row.status,
      sortOrder: templateTask?.sort_order ?? 0,
    };
  });
}

export function countOverdueTasks(rows: ReportTaskRow[], now = new Date()): number {
  return rows.filter((row) => {
    if (!row.due_at) return false;
    if (row.status === 'completed' || row.status === 'skipped') return false;
    return new Date(row.due_at).getTime() < now.getTime();
  }).length;
}

export function computeCurrentPhaseLabel(tasks: DashboardTask[]): string {
  for (const phase of ['Day 1', 'Week 1', 'Month 1'] as const) {
    const phaseTasks = tasks.filter((task) => normalizePhase(task.phaseName) === phase);
    if (phaseTasks.length === 0) continue;
    const incomplete = phaseTasks.some(
      (task) => task.status !== 'completed' && task.status !== 'skipped',
    );
    if (incomplete) return phase;
  }
  return 'Month 1';
}

export function buildDirectReportProgress(
  profile: { id: string; full_name: string; email: string; job_title: string | null },
  taskRows: ReportTaskRow[],
): DirectReportProgress {
  const tasks = mapReportTasks(taskRows);
  const completedTasks = taskRows.filter((row) => row.status === 'completed').length;

  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    jobTitle: profile.job_title,
    progressPercent: computeProgressPercent(tasks),
    completedTasks,
    totalTasks: taskRows.length,
    overdueCount: countOverdueTasks(taskRows),
    currentPhase: computeCurrentPhaseLabel(tasks),
    statuses: taskRows.map((row) => row.status),
  };
}

export function sortReportsByProgress(reports: DirectReportProgress[]): DirectReportProgress[] {
  return [...reports].sort((a, b) => a.progressPercent - b.progressPercent);
}
