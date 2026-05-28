import { computeTaskDueAt } from '@/lib/dueDate';

export interface NewHireFormValues {
  fullName: string;
  email: string;
  role: string;
  departmentId: string;
  managerId: string;
  startDate: string;
  jobTitle: string;
  photoUrl: string;
}

export interface OnboardingTemplateMatch {
  id: string;
  name: string;
  targetRole: string | null;
  targetDepartment: string | null;
}

export interface TemplateTaskForPlan {
  id: string;
  dueDateOffsetDays: number;
}

export interface TaskProgressDraft {
  templateTaskId: string;
  dueAt: string;
  status: 'pending';
}

export function validateNewHireForm(values: NewHireFormValues, existingEmails: string[]): string | null {
  if (!values.fullName.trim()) return 'Full name is required';
  if (!values.email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) return 'Enter a valid email address';
  if (existingEmails.map((e) => e.toLowerCase()).includes(values.email.trim().toLowerCase())) {
    return 'Email already exists';
  }
  if (!values.departmentId) return 'Department is required';
  if (!values.startDate) return 'Start date is required';
  return null;
}

export function matchOnboardingTemplate(
  templates: OnboardingTemplateMatch[],
  role: string,
  departmentName: string | null,
): OnboardingTemplateMatch | null {
  const active = templates.filter((t) => t.targetRole === role || t.targetRole === 'employee');

  const deptMatch = active.find(
    (t) => t.targetDepartment && departmentName && t.targetDepartment === departmentName,
  );
  if (deptMatch) return deptMatch;

  const roleOnly = active.find((t) => !t.targetDepartment);
  return roleOnly ?? active[0] ?? null;
}

export function buildTaskProgressDrafts(
  tasks: TemplateTaskForPlan[],
  startDate: string,
): TaskProgressDraft[] {
  return tasks.map((task) => ({
    templateTaskId: task.id,
    dueAt: computeTaskDueAt(startDate, task.dueDateOffsetDays),
    status: 'pending' as const,
  }));
}
