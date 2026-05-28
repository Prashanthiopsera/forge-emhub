import {
  computeDaysOverdueFromDueAt,
  escalationLevelForOverdueDays,
  reminderKindForTask,
  type ComplianceEscalationLevel,
  type ComplianceReminderKind,
} from '@/lib/dueDate';

export interface ComplianceTaskCandidate {
  id: string;
  userId: string;
  managerId: string | null;
  title: string;
  dueAt: string | null;
  status: string;
}

export interface ComplianceNotificationDraft {
  userId: string;
  title: string;
  body: string;
  type: 'compliance_reminder' | 'compliance_escalation';
  link: string;
}

export function buildReminderNotification(
  task: ComplianceTaskCandidate,
  kind: ComplianceReminderKind,
): ComplianceNotificationDraft | null {
  if (!kind) return null;

  const messages: Record<Exclude<ComplianceReminderKind, null>, { title: string; body: string }> = {
    day_before: {
      title: 'Task due tomorrow',
      body: `"${task.title}" is due tomorrow. Complete it from your checklist.`,
    },
    due_today: {
      title: 'Task due today',
      body: `"${task.title}" is due today. Please complete it to stay on track.`,
    },
    day_overdue: {
      title: 'Task overdue',
      body: `"${task.title}" was due yesterday and is now overdue.`,
    },
  };

  const copy = messages[kind];
  return {
    userId: task.userId,
    title: copy.title,
    body: copy.body,
    type: 'compliance_reminder',
    link: '/checklist',
  };
}

export function buildEscalationNotifications(
  task: ComplianceTaskCandidate,
  level: ComplianceEscalationLevel,
  hrAdminIds: string[],
): ComplianceNotificationDraft[] {
  if (level === 'none') return [];

  const daysOverdue = computeDaysOverdueFromDueAt(task.dueAt);
  const drafts: ComplianceNotificationDraft[] = [];

  if (level === 'manager' && task.managerId) {
    drafts.push({
      userId: task.managerId,
      title: 'Direct report task overdue',
      body: `"${task.title}" is ${daysOverdue} day(s) overdue for your team member.`,
      type: 'compliance_escalation',
      link: '/team-progress',
    });
  }

  if (level === 'hr') {
    for (const hrId of hrAdminIds) {
      drafts.push({
        userId: hrId,
        title: 'Compliance escalation',
        body: `"${task.title}" is ${daysOverdue}+ days overdue and requires HR follow-up.`,
        type: 'compliance_escalation',
        link: '/analytics',
      });
    }
  }

  return drafts;
}

export function complianceActionsForTask(
  task: ComplianceTaskCandidate,
  hrAdminIds: string[],
  now = new Date(),
): ComplianceNotificationDraft[] {
  const reminder = buildReminderNotification(
    task,
    reminderKindForTask(task.dueAt, task.status, now),
  );
  const escalation = buildEscalationNotifications(
    task,
    escalationLevelForOverdueDays(computeDaysOverdueFromDueAt(task.dueAt, now)),
    hrAdminIds,
  );

  return [...(reminder ? [reminder] : []), ...escalation];
}
