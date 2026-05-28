import { describe, expect, it } from 'vitest';
import {
  buildTaskProgressDrafts,
  matchOnboardingTemplate,
  validateNewHireForm,
} from '@/features/new-hire/newHire.logic';

describe('newHire.logic (WO-032)', () => {
  const templates = [
    {
      id: 't1',
      name: 'Engineering IC',
      targetRole: 'employee',
      targetDepartment: 'Engineering',
    },
    {
      id: 't2',
      name: 'Day 1 Essentials',
      targetRole: 'employee',
      targetDepartment: null,
    },
  ];

  it('validates required fields and duplicate email', () => {
    expect(
      validateNewHireForm(
        {
          fullName: '',
          email: 'bad',
          role: 'employee',
          departmentId: '',
          managerId: '',
          startDate: '',
          jobTitle: '',
          photoUrl: '',
        },
        ['existing@emhub.local'],
      ),
    ).toMatch(/name|email|department|date/i);

    expect(
      validateNewHireForm(
        {
          fullName: 'Jordan Lee',
          email: 'existing@emhub.local',
          role: 'employee',
          departmentId: 'dept-1',
          managerId: '',
          startDate: '2026-06-01',
          jobTitle: '',
          photoUrl: '',
        },
        ['existing@emhub.local'],
      ),
    ).toMatch(/already exists/i);
  });

  it('matches template by role and department', () => {
    expect(matchOnboardingTemplate(templates, 'employee', 'Engineering')?.id).toBe('t1');
    expect(matchOnboardingTemplate(templates, 'employee', 'Unknown')?.id).toBe('t2');
  });

  it('generates task progress with computed due dates', () => {
    const drafts = buildTaskProgressDrafts(
      [
        { id: 'tt1', dueDateOffsetDays: 0 },
        { id: 'tt2', dueDateOffsetDays: 7 },
      ],
      '2026-06-01',
    );

    expect(drafts).toHaveLength(2);
    expect(drafts[0].dueAt).toContain('2026-06-01');
    expect(drafts[1].dueAt).toContain('2026-06-08');
  });
});
