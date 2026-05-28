import { describe, expect, it } from 'vitest';
import {
  buildDirectReportProgress,
  countOverdueTasks,
  sortReportsByProgress,
} from '@/features/manager/manager.logic';

describe('manager.logic (WO-026)', () => {
  it('computes progress and overdue counts for a direct report', () => {
    const rows = [
      {
        status: 'completed' as const,
        due_at: null,
        template_tasks: { title: 'A', phase_name: 'Day 1', sort_order: 1 },
      },
      {
        status: 'pending' as const,
        due_at: new Date(Date.now() - 86400000).toISOString(),
        template_tasks: { title: 'B', phase_name: 'Day 1', sort_order: 2 },
      },
    ];

    expect(countOverdueTasks(rows)).toBe(1);

    const report = buildDirectReportProgress(
      {
        id: 'u1',
        full_name: 'Alex Chen',
        email: 'alex@emhub.local',
        job_title: 'Engineer',
      },
      rows,
    );

    expect(report.progressPercent).toBe(50);
    expect(report.overdueCount).toBe(1);
  });

  it('sorts reports by ascending progress', () => {
    const sorted = sortReportsByProgress([
      {
        id: '1',
        fullName: 'A',
        email: 'a@x.com',
        jobTitle: null,
        progressPercent: 80,
        completedTasks: 4,
        totalTasks: 5,
        overdueCount: 0,
        currentPhase: 'Week 1',
        statuses: [],
      },
      {
        id: '2',
        fullName: 'B',
        email: 'b@x.com',
        jobTitle: null,
        progressPercent: 20,
        completedTasks: 1,
        totalTasks: 5,
        overdueCount: 1,
        currentPhase: 'Day 1',
        statuses: [],
      },
    ]);

    expect(sorted[0].fullName).toBe('B');
  });
});
