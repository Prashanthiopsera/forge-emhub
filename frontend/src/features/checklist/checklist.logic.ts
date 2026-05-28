import {
  computeProgressPercent,
  normalizePhase,
  TIMELINE_PHASES,
} from '@/features/dashboard/dashboard.logic';
import type { DashboardTask } from '@/features/dashboard/dashboard.types';
import type { ChecklistPhaseGroup, ChecklistTask } from '@/features/checklist/checklist.types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function mapRowToChecklistTask(row: {
  id: string;
  status: ChecklistTask['status'];
  due_at: string | null;
  completed_at: string | null;
  template_tasks:
    | { title: string; phase_name: string; sort_order: number }
    | { title: string; phase_name: string; sort_order: number }[]
    | null;
}): ChecklistTask {
  const templateTask = Array.isArray(row.template_tasks)
    ? row.template_tasks[0]
    : row.template_tasks;
  const phaseName = templateTask?.phase_name ?? 'Week 1';

  return {
    id: row.id,
    title: templateTask?.title ?? 'Onboarding task',
    description: null,
    phaseName,
    phase: normalizePhase(phaseName),
    status: row.status,
    sortOrder: templateTask?.sort_order ?? 0,
    dueAt: row.due_at,
    completedAt: row.completed_at,
  };
}

export function sortChecklistTasks(tasks: ChecklistTask[]): ChecklistTask[] {
  const phaseRank = new Map(TIMELINE_PHASES.map((phase, index) => [phase, index]));

  return [...tasks].sort((a, b) => {
    const phaseDiff = (phaseRank.get(a.phase) ?? 99) - (phaseRank.get(b.phase) ?? 99);
    if (phaseDiff !== 0) return phaseDiff;
    return a.sortOrder - b.sortOrder;
  });
}

export function groupTasksByPhase(tasks: ChecklistTask[]): ChecklistPhaseGroup[] {
  const sorted = sortChecklistTasks(tasks);

  return TIMELINE_PHASES.map((phase) => ({
    phase,
    tasks: sorted.filter((task) => task.phase === phase),
  })).filter((group) => group.tasks.length > 0);
}

export function computeChecklistProgressPercent(tasks: ChecklistTask[]): number {
  const dashboardTasks: DashboardTask[] = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    phaseName: task.phaseName,
    status: task.status,
    sortOrder: task.sortOrder,
  }));
  return computeProgressPercent(dashboardTasks);
}

export function isTaskOverdue(task: ChecklistTask, now = new Date()): boolean {
  if (!task.dueAt) return false;
  if (task.status === 'completed' || task.status === 'skipped') return false;
  return new Date(task.dueAt).getTime() < now.getTime();
}

export function computeDaysOverdue(task: ChecklistTask, now = new Date()): number {
  if (!isTaskOverdue(task, now) || !task.dueAt) return 0;
  const dueMs = new Date(task.dueAt).getTime();
  return Math.max(1, Math.floor((now.getTime() - dueMs) / MS_PER_DAY));
}

export function formatDueDate(dueAt: string | null): string {
  if (!dueAt) return 'No due date';
  const parsed = new Date(dueAt);
  if (Number.isNaN(parsed.getTime())) return dueAt;
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function canMarkComplete(task: ChecklistTask): boolean {
  return task.status === 'pending' || task.status === 'in_progress';
}
