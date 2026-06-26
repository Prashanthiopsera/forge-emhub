import type { TeamProgressData } from '@/features/manager/manager.types';

export const MORGAN_MANAGER_ID = 'a1000000-0000-4000-8000-000000000010';

export function buildTeamProgressFixture(managerId = MORGAN_MANAGER_ID): TeamProgressData {
  if (managerId !== MORGAN_MANAGER_ID) {
    return { reports: [], source: 'fixture' };
  }

  return {
    source: 'fixture',
    reports: [
      {
        id: 'a1000000-0000-4000-8000-000000000001',
        fullName: 'Alex Chen',
        email: 'alex.newhire@emhub.local',
        jobTitle: 'Software Engineer',
        progressPercent: 20,
        completedTasks: 1,
        totalTasks: 5,
        overdueCount: 1,
        currentPhase: 'Day 1',
        statuses: ['completed', 'in_progress', 'pending', 'pending', 'pending'],
      },
      {
        id: 'a1000000-0000-4000-8000-000000000002',
        fullName: 'Jordan Lee',
        email: 'jordan.newhire@emhub.local',
        jobTitle: 'Software Engineer',
        progressPercent: 40,
        completedTasks: 2,
        totalTasks: 5,
        overdueCount: 0,
        currentPhase: 'Week 1',
        statuses: ['completed', 'completed', 'in_progress', 'pending', 'pending'],
      },
    ],
  };
}
