import type { TaskStatus } from '@/features/dashboard/dashboard.types';

export interface DirectReportProgress {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string | null;
  progressPercent: number;
  completedTasks: number;
  totalTasks: number;
  overdueCount: number;
  currentPhase: string;
  statuses: TaskStatus[];
}

export interface TeamProgressData {
  reports: DirectReportProgress[];
  source: 'supabase' | 'fixture';
}
