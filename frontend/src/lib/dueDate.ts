const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type ComplianceReminderKind = 'day_before' | 'due_today' | 'day_overdue' | null;

export type ComplianceEscalationLevel = 'none' | 'manager' | 'hr';

export function parseStartDate(startDate: string | Date): Date {
  if (startDate instanceof Date) return startDate;
  const parsed = new Date(`${startDate}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid start date: ${startDate}`);
  }
  return parsed;
}

/** Computes task due_at as start_date + offset days (UTC noon anchor). */
export function computeTaskDueAt(startDate: string | Date, offsetDays: number): string {
  const start = parseStartDate(startDate);
  const due = new Date(start.getTime() + offsetDays * MS_PER_DAY);
  return due.toISOString();
}

export function daysFromDue(dueAt: string | null, now = new Date()): number | null {
  if (!dueAt) return null;
  const dueMs = new Date(dueAt).getTime();
  if (Number.isNaN(dueMs)) return null;
  return Math.round((dueMs - now.getTime()) / MS_PER_DAY);
}

export function reminderKindForTask(
  dueAt: string | null,
  status: string,
  now = new Date(),
): ComplianceReminderKind {
  if (!dueAt) return null;
  if (status === 'completed' || status === 'skipped') return null;

  const days = daysFromDue(dueAt, now);
  if (days === null) return null;
  if (days === 1) return 'day_before';
  if (days === 0) return 'due_today';
  if (days === -1) return 'day_overdue';
  return null;
}

export function escalationLevelForOverdueDays(daysOverdue: number): ComplianceEscalationLevel {
  if (daysOverdue < 1) return 'none';
  if (daysOverdue < 3) return 'manager';
  return 'hr';
}

export function computeDaysOverdueFromDueAt(dueAt: string | null, now = new Date()): number {
  const days = daysFromDue(dueAt, now);
  if (days === null || days >= 0) return 0;
  return Math.abs(days);
}
