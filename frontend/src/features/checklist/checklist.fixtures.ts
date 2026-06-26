import { ALEX_USER_ID } from '@/features/dashboard/dashboard.fixtures';
import {
  computeChecklistProgressPercent,
  groupTasksByPhase,
} from '@/features/checklist/checklist.logic';
import type { ChecklistData, ChecklistTask } from '@/features/checklist/checklist.types';

export { ALEX_USER_ID };

const overdueDue = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

const alexChecklistTasks: ChecklistTask[] = [
  {
    id: 'b3000000-0000-4000-8000-000000000001',
    title: 'Complete security training',
    description: 'Finish the mandatory security awareness module in the training portal.',
    phaseName: 'Day 1',
    phase: 'Day 1',
    status: 'completed',
    sortOrder: 1,
    dueAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: 'b3000000-0000-4000-8000-000000000003',
    title: 'Meet your manager',
    description: 'Schedule a 30-minute intro meeting with your direct manager.',
    phaseName: 'Day 1',
    phase: 'Day 1',
    status: 'pending',
    sortOrder: 2,
    dueAt: overdueDue,
    completedAt: null,
  },
  {
    id: 'b3000000-0000-4000-8000-000000000002',
    title: 'Set up development environment',
    description: 'Clone repos, install tooling, and verify local build passes.',
    phaseName: 'Week 1',
    phase: 'Week 1',
    status: 'in_progress',
    sortOrder: 1,
    dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
  },
  {
    id: 'b3000000-0000-4000-8000-000000000004',
    title: 'Shadow a team standup',
    description: 'Attend at least one team standup to learn rituals and stakeholders.',
    phaseName: 'Week 1',
    phase: 'Week 1',
    status: 'pending',
    sortOrder: 2,
    dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
  },
  {
    id: 'b3000000-0000-4000-8000-000000000005',
    title: 'Complete 30-day goals review',
    description: 'Document initial goals and review them with your manager.',
    phaseName: 'Month 1',
    phase: 'Month 1',
    status: 'pending',
    sortOrder: 1,
    dueAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
  },
];

export function buildChecklistFixture(userId = ALEX_USER_ID): ChecklistData {
  const tasks = userId === ALEX_USER_ID ? alexChecklistTasks : [];

  return {
    tasks,
    phaseGroups: groupTasksByPhase(tasks),
    progressPercent: computeChecklistProgressPercent(tasks),
    source: 'fixture',
  };
}
