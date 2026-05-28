export interface DepartmentMetric {
  departmentName: string;
  employeeCount: number;
  avgProgressPercent: number;
  overdueCount: number;
}

export interface AnalyticsMetrics {
  activeOnboarding: number;
  avgCompletionPercent: number;
  overdueTasks: number;
  completedThisMonth: number;
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  byDepartment: DepartmentMetric[];
  source: 'supabase' | 'fixture';
}
