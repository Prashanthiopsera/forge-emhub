import { describe, expect, it } from 'vitest';
import { complianceActionsForTask } from '@/features/compliance/compliance.logic';
import { computeTaskDueAt } from '@/lib/dueDate';

describe('compliance.logic (WO-015)', () => {
  const startDate = '2026-05-01';
  const dueTomorrow = computeTaskDueAt(startDate, 1);
  const dueDay = new Date(dueTomorrow);
  const now = new Date(dueDay.getTime() - 24 * 60 * 60 * 1000);

  it('builds reminder notification one day before due', () => {
    const actions = complianceActionsForTask(
      {
        id: 'tp1',
        userId: 'user-1',
        managerId: 'mgr-1',
        title: 'Security training',
        dueAt: dueTomorrow,
        status: 'pending',
      },
      [],
      now,
    );

    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('compliance_reminder');
    expect(actions[0].title).toContain('tomorrow');
  });

  it('escalates to HR after three overdue days', () => {
    const overdueDue = computeTaskDueAt(startDate, -4);
    const actions = complianceActionsForTask(
      {
        id: 'tp2',
        userId: 'user-1',
        managerId: 'mgr-1',
        title: '30-day review',
        dueAt: overdueDue,
        status: 'pending',
      },
      ['hr-1'],
      new Date(),
    );

    expect(actions.some((a) => a.type === 'compliance_escalation' && a.userId === 'hr-1')).toBe(
      true,
    );
  });
});
