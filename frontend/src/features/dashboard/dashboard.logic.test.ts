import { describe, expect, it } from 'vitest';
import {
  computeCurrentPhase,
  computeProgressPercent,
  selectNextActions,
} from '@/features/dashboard/dashboard.logic';
import type { DashboardTask } from '@/features/dashboard/dashboard.types';

const sampleTasks: DashboardTask[] = [
  {
    id: '1',
    title: 'Day task done',
    phaseName: 'Day 1',
    status: 'completed',
    sortOrder: 1,
  },
  {
    id: '2',
    title: 'Day task open',
    phaseName: 'Day 1',
    status: 'pending',
    sortOrder: 2,
  },
  {
    id: '3',
    title: 'Week task',
    phaseName: 'Week 1',
    status: 'in_progress',
    sortOrder: 1,
  },
];

describe('dashboard.logic', () => {
  it('computes progress from completed countable tasks', () => {
    expect(computeProgressPercent(sampleTasks)).toBe(33);
  });

  it('highlights Day 1 while day-phase tasks remain incomplete', () => {
    expect(computeCurrentPhase(sampleTasks)).toBe('Day 1');
  });

  it('returns top incomplete tasks ordered by phase then sort order', () => {
    const next = selectNextActions(sampleTasks, 3);
    expect(next.map((task) => task.id)).toEqual(['2', '3']);
  });
});
