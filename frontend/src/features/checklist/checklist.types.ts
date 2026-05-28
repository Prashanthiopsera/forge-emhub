import type { OnboardingPhase } from '@/features/dashboard/dashboard.types';
import type { TaskStatus } from '@/features/dashboard/dashboard.types';

export type ChecklistSource = 'supabase' | 'fixture';

export interface ChecklistTask {
  id: string;
  title: string;
  description: string | null;
  phaseName: string;
  phase: OnboardingPhase;
  status: TaskStatus;
  sortOrder: number;
  dueAt: string | null;
  completedAt: string | null;
}

export interface ChecklistPhaseGroup {
  phase: OnboardingPhase;
  tasks: ChecklistTask[];
}

export interface ChecklistData {
  tasks: ChecklistTask[];
  phaseGroups: ChecklistPhaseGroup[];
  progressPercent: number;
  source: ChecklistSource;
}
