import { computeProgressPercent } from '@/features/dashboard/dashboard.logic';
import type { DashboardTask, TaskStatus } from '@/features/dashboard/dashboard.types';
import type { AnalyticsData, AnalyticsMetrics, DepartmentMetric } from '@/features/analytics/analytics.types';

export interface AnalyticsTaskRow {
  user_id: string;
  status: TaskStatus;
  due_at: string | null;
  completed_at: string | null;
  template_tasks:
    | { title: string; phase_name: string; sort_order: number }
    | { title: string; phase_name: string; sort_order: number }[]
    | null;
}

export interface AnalyticsProfileRow {
  id: string;
  role: string;
  departments: { name: string } | { name: string }[] | null;
}

export function departmentNameFromRow(row: AnalyticsProfileRow): string {
  const department = Array.isArray(row.departments) ? row.departments[0] : row.departments;
  return department?.name ?? 'Unassigned';
}

export function tasksForUser(rows: AnalyticsTaskRow[], userId: string): DashboardTask[] {
  return rows
    .filter((row) => row.user_id === userId)
    .map((row) => {
      const templateTask = Array.isArray(row.template_tasks)
        ? row.template_tasks[0]
        : row.template_tasks;
      return {
        id: '',
        title: templateTask?.title ?? 'Task',
        phaseName: templateTask?.phase_name ?? 'Week 1',
        status: row.status,
        sortOrder: templateTask?.sort_order ?? 0,
      };
    });
}

export function countOverdue(rows: AnalyticsTaskRow[], now = new Date()): number {
  return rows.filter((row) => {
    if (!row.due_at) return false;
    if (row.status === 'completed' || row.status === 'skipped') return false;
    return new Date(row.due_at).getTime() < now.getTime();
  }).length;
}

export function countCompletedThisMonth(rows: AnalyticsTaskRow[], now = new Date()): number {
  const month = now.getMonth();
  const year = now.getFullYear();
  return rows.filter((row) => {
    if (!row.completed_at || row.status !== 'completed') return false;
    const completed = new Date(row.completed_at);
    return completed.getMonth() === month && completed.getFullYear() === year;
  }).length;
}

export function buildAnalyticsMetrics(
  employees: AnalyticsProfileRow[],
  taskRows: AnalyticsTaskRow[],
): AnalyticsMetrics {
  const employeeIds = employees.map((profile) => profile.id);
  const employeeTasks = taskRows.filter((row) => employeeIds.includes(row.user_id));

  const progressValues = employeeIds.map((id) =>
    computeProgressPercent(tasksForUser(employeeTasks, id)),
  );

  const avgCompletionPercent =
    progressValues.length === 0
      ? 0
      : Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length);

  return {
    activeOnboarding: employees.length,
    avgCompletionPercent,
    overdueTasks: countOverdue(employeeTasks),
    completedThisMonth: countCompletedThisMonth(employeeTasks),
  };
}

export function buildDepartmentMetrics(
  employees: AnalyticsProfileRow[],
  taskRows: AnalyticsTaskRow[],
): DepartmentMetric[] {
  const byDepartment = new Map<string, AnalyticsProfileRow[]>();

  for (const profile of employees) {
    const name = departmentNameFromRow(profile);
    const list = byDepartment.get(name) ?? [];
    list.push(profile);
    byDepartment.set(name, list);
  }

  return [...byDepartment.entries()]
    .map(([departmentName, deptEmployees]) => {
      const ids = deptEmployees.map((profile) => profile.id);
      const deptTasks = taskRows.filter((row) => ids.includes(row.user_id));
      const progressValues = ids.map((id) => computeProgressPercent(tasksForUser(deptTasks, id)));
      const avgProgressPercent =
        progressValues.length === 0
          ? 0
          : Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length);

      return {
        departmentName,
        employeeCount: deptEmployees.length,
        avgProgressPercent,
        overdueCount: countOverdue(deptTasks),
      };
    })
    .sort((a, b) => b.employeeCount - a.employeeCount);
}

export function analyticsToCsv(data: AnalyticsData): string {
  const lines = [
    'metric,value',
    `active_onboarding,${data.metrics.activeOnboarding}`,
    `avg_completion_percent,${data.metrics.avgCompletionPercent}`,
    `overdue_tasks,${data.metrics.overdueTasks}`,
    `completed_this_month,${data.metrics.completedThisMonth}`,
    '',
    'department,employees,avg_progress_percent,overdue_count',
  ];

  for (const row of data.byDepartment) {
    lines.push(
      `${escapeCsv(row.departmentName)},${row.employeeCount},${row.avgProgressPercent},${row.overdueCount}`,
    );
  }

  return lines.join('\n');
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
