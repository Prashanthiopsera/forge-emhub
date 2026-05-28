import { describe, expect, it } from 'vitest';
import {
  computeTaskDueAt,
  escalationLevelForOverdueDays,
  reminderKindForTask,
} from '@/lib/dueDate';

describe('dueDate (WO-015)', () => {
  const startDate = '2026-05-01';

  it('computes due_at from start date and offset days', () => {
    const due = computeTaskDueAt(startDate, 7);
    expect(due).toContain('2026-05-08');
  });

  it('schedules reminder kinds relative to due date', () => {
    const dueAt = computeTaskDueAt(startDate, 0);
    const dueDay = new Date(dueAt);

    expect(reminderKindForTask(dueAt, 'pending', new Date(dueDay.getTime() - MS_PER_DAY))).toBe(
      'day_before',
    );
    expect(reminderKindForTask(dueAt, 'pending', dueDay)).toBe('due_today');
    expect(reminderKindForTask(dueAt, 'pending', new Date(dueDay.getTime() + MS_PER_DAY))).toBe(
      'day_overdue',
    );
    expect(reminderKindForTask(dueAt, 'completed', dueDay)).toBeNull();
  });

  it('escalates to manager then HR based on overdue days', () => {
    expect(escalationLevelForOverdueDays(0)).toBe('none');
    expect(escalationLevelForOverdueDays(1)).toBe('manager');
    expect(escalationLevelForOverdueDays(3)).toBe('hr');
  });
});

const MS_PER_DAY = 24 * 60 * 60 * 1000;
