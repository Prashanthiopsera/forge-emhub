import {
  computeCurrentPhase,
  computeProgressPercent,
  selectNextActions,
} from '@/features/dashboard/dashboard.logic';
import type { DashboardData, DashboardTask } from '@/features/dashboard/dashboard.types';

export const ALEX_USER_ID = 'a1000000-0000-4000-8000-000000000001';

const alexTasks: DashboardTask[] = [
  {
    id: 'b3000000-0000-4000-8000-000000000001',
    title: 'Complete security training',
    phaseName: 'Day 1',
    status: 'completed',
    sortOrder: 1,
  },
  {
    id: 'b3000000-0000-4000-8000-000000000002',
    title: 'Set up development environment',
    phaseName: 'Week 1',
    status: 'in_progress',
    sortOrder: 2,
  },
  {
    id: 'b3000000-0000-4000-8000-000000000003',
    title: 'Meet your manager',
    phaseName: 'Day 1',
    status: 'pending',
    sortOrder: 1,
  },
];

export function buildDashboardFixture(userId = ALEX_USER_ID): DashboardData {
  const tasks = userId === ALEX_USER_ID ? alexTasks : [];

  return {
    profile: {
      fullName: 'Alex Chen',
      jobTitle: 'Software Engineer',
      departmentName: 'Platform',
      role: 'employee',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    },
    tasks,
    progressPercent: computeProgressPercent(tasks),
    currentPhase: computeCurrentPhase(tasks),
    nextActions: selectNextActions(tasks),
    source: 'fixture',
  };
}
