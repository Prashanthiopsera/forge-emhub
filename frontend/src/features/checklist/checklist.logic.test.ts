import { describe, expect, it } from 'vitest';
import { buildChecklistFixture } from '@/features/checklist/checklist.fixtures';
import {
  computeDaysOverdue,
  computeChecklistProgressPercent,
  groupTasksByPhase,
  isTaskOverdue,
  mapRowToChecklistTask,
} from '@/features/checklist/checklist.logic';

describe('checklist.logic (WO-012)', () => {
  it('groups tasks by Day 1, Week 1, and Month 1', () => {
    const { tasks } = buildChecklistFixture();
    const groups = groupTasksByPhase(tasks);

    expect(groups.map((g) => g.phase)).toEqual(['Day 1', 'Week 1', 'Month 1']);
    expect(groups[0].tasks).toHaveLength(2);
    expect(groups[1].tasks).toHaveLength(2);
    expect(groups[2].tasks).toHaveLength(1);
  });

  it('computes progress percent from completed tasks', () => {
    const { tasks } = buildChecklistFixture();
    expect(computeChecklistProgressPercent(tasks)).toBe(20);
  });

  it('flags overdue pending tasks and counts days', () => {
    const overdueTask = buildChecklistFixture().tasks.find((t) => t.title === 'Meet your manager');
    expect(overdueTask).toBeDefined();
    expect(isTaskOverdue(overdueTask!)).toBe(true);
    expect(computeDaysOverdue(overdueTask!)).toBeGreaterThanOrEqual(3);
  });

  it('maps Supabase rows into checklist tasks', () => {
    const task = mapRowToChecklistTask({
      id: 'tp1',
      status: 'in_progress',
      due_at: '2026-05-01T00:00:00Z',
      completed_at: null,
      template_tasks: {
        title: 'Set up development environment',
        phase_name: 'Week 1',
        sort_order: 1,
      },
    });

    expect(task.phase).toBe('Week 1');
    expect(task.title).toBe('Set up development environment');
  });
});
