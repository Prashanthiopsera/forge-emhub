import type { AnalyticsData } from '@/features/analytics/analytics.types';

export function buildAnalyticsFixture(): AnalyticsData {
  return {
    source: 'fixture',
    metrics: {
      activeOnboarding: 12,
      avgCompletionPercent: 48,
      overdueTasks: 3,
      completedThisMonth: 8,
    },
    byDepartment: [
      { departmentName: 'Platform', employeeCount: 12, avgProgressPercent: 42, overdueCount: 2 },
      { departmentName: 'Engineering', employeeCount: 4, avgProgressPercent: 55, overdueCount: 1 },
      { departmentName: 'Product', employeeCount: 2, avgProgressPercent: 61, overdueCount: 0 },
    ],
  };
}
