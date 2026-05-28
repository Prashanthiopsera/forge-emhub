import type { DashboardTask, OnboardingPhase } from '@/features/dashboard/dashboard.types';

export const TIMELINE_PHASES: OnboardingPhase[] = ['Day 1', 'Week 1', 'Month 1'];

export function normalizePhase(phaseName: string): OnboardingPhase {
  const normalized = phaseName.trim().toLowerCase();
  if (normalized.includes('day')) return 'Day 1';
  if (normalized.includes('month')) return 'Month 1';
  return 'Week 1';
}

export function computeProgressPercent(tasks: DashboardTask[]): number {
  const countable = tasks.filter((task) => task.status !== 'skipped');
  if (countable.length === 0) return 0;
  const completed = countable.filter((task) => task.status === 'completed').length;
  return Math.round((completed / countable.length) * 100);
}

export function computeCurrentPhase(tasks: DashboardTask[]): OnboardingPhase {
  for (const phase of TIMELINE_PHASES) {
    const phaseTasks = tasks.filter((task) => normalizePhase(task.phaseName) === phase);
    if (phaseTasks.length === 0) continue;
    const hasIncomplete = phaseTasks.some(
      (task) => task.status !== 'completed' && task.status !== 'skipped',
    );
    if (hasIncomplete) return phase;
  }
  return 'Month 1';
}

export function selectNextActions(tasks: DashboardTask[], limit = 3): DashboardTask[] {
  const phaseRank = new Map(TIMELINE_PHASES.map((phase, index) => [phase, index]));

  return tasks
    .filter((task) => task.status === 'pending' || task.status === 'in_progress')
    .sort((a, b) => {
      const phaseDiff =
        (phaseRank.get(normalizePhase(a.phaseName)) ?? 99) -
        (phaseRank.get(normalizePhase(b.phaseName)) ?? 99);
      if (phaseDiff !== 0) return phaseDiff;
      return a.sortOrder - b.sortOrder;
    })
    .slice(0, limit);
}

export function formatRoleLabel(role: string): string {
  return role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatStartDate(startDate: string | null): string {
  if (!startDate) return '—';
  const parsed = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return startDate;
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
