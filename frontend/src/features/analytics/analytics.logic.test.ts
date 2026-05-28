import { describe, expect, it } from 'vitest';
import {
  analyticsToCsv,
  buildAnalyticsMetrics,
  buildDepartmentMetrics,
} from '@/features/analytics/analytics.logic';
import { buildAnalyticsFixture } from '@/features/analytics/analytics.fixtures';

describe('analytics.logic (WO-027)', () => {
  it('builds org metrics from profiles and tasks', () => {
    const employees = [
      { id: 'u1', role: 'employee', departments: { name: 'Platform' } },
      { id: 'u2', role: 'employee', departments: { name: 'Platform' } },
    ];
    const tasks = [
      {
        user_id: 'u1',
        status: 'completed' as const,
        due_at: null,
        completed_at: new Date().toISOString(),
        template_tasks: { title: 'A', phase_name: 'Day 1', sort_order: 1 },
      },
      {
        user_id: 'u1',
        status: 'pending' as const,
        due_at: new Date(Date.now() - 86400000).toISOString(),
        completed_at: null,
        template_tasks: { title: 'B', phase_name: 'Day 1', sort_order: 2 },
      },
      {
        user_id: 'u2',
        status: 'completed' as const,
        due_at: null,
        completed_at: new Date().toISOString(),
        template_tasks: { title: 'C', phase_name: 'Day 1', sort_order: 1 },
      },
    ];

    const metrics = buildAnalyticsMetrics(employees, tasks);
    expect(metrics.activeOnboarding).toBe(2);
    expect(metrics.overdueTasks).toBe(1);
    expect(metrics.completedThisMonth).toBeGreaterThanOrEqual(2);

    const departments = buildDepartmentMetrics(employees, tasks);
    expect(departments[0].departmentName).toBe('Platform');
    expect(departments[0].employeeCount).toBe(2);
  });

  it('exports analytics as CSV', () => {
    const csv = analyticsToCsv(buildAnalyticsFixture());
    expect(csv).toContain('active_onboarding,12');
    expect(csv).toContain('department,employees,avg_progress_percent,overdue_count');
    expect(csv).toContain('Platform,12,42,2');
  });
});
