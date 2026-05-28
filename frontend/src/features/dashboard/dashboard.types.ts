import type { AppRole } from '@/types/database.types';

export type OnboardingPhase = 'Day 1' | 'Week 1' | 'Month 1';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface DashboardTask {
  id: string;
  title: string;
  phaseName: string;
  status: TaskStatus;
  sortOrder: number;
}

export interface DashboardProfile {
  fullName: string;
  jobTitle: string | null;
  departmentName: string | null;
  role: AppRole;
  startDate: string | null;
}

export interface DashboardData {
  profile: DashboardProfile;
  tasks: DashboardTask[];
  progressPercent: number;
  currentPhase: OnboardingPhase;
  nextActions: DashboardTask[];
  source: 'supabase' | 'fixture';
}
