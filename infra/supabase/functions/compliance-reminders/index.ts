/**
 * WO-015: Daily compliance deadline scan (Edge Function stub).
 * Identifies tasks approaching/past due and creates in-app notification drafts.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type ReminderKind = 'day_before' | 'due_today' | 'day_overdue' | null;
type EscalationLevel = 'none' | 'manager' | 'hr';

function daysFromDue(dueAt: string, now: Date): number {
  return Math.round((new Date(dueAt).getTime() - now.getTime()) / MS_PER_DAY);
}

function reminderKind(dueAt: string, status: string, now: Date): ReminderKind {
  if (status === 'completed' || status === 'skipped') return null;
  const days = daysFromDue(dueAt, now);
  if (days === 1) return 'day_before';
  if (days === 0) return 'due_today';
  if (days === -1) return 'day_overdue';
  return null;
}

function escalationLevel(dueAt: string, status: string, now: Date): EscalationLevel {
  if (status === 'completed' || status === 'skipped') return 'none';
  const days = daysFromDue(dueAt, now);
  if (days >= 0) return 'none';
  const overdue = Math.abs(days);
  if (overdue < 1) return 'none';
  if (overdue < 3) return 'manager';
  return 'hr';
}

interface TaskRow {
  id: string;
  user_id: string;
  status: string;
  due_at: string;
  template_tasks: { title: string } | { title: string }[] | null;
  profiles: { manager_id: string | null } | { manager_id: string | null }[] | null;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase env' }), { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const now = new Date();

  const { data: hrAdmins } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'hr_admin')
    .is('deleted_at', null);

  const hrIds = (hrAdmins ?? []).map((row: { id: string }) => row.id);

  const { data: tasks, error } = await supabase
    .from('task_progress')
    .select(
      'id, user_id, status, due_at, template_tasks(title), profiles!task_progress_user_id_fkey(manager_id)',
    )
    .not('due_at', 'is', null)
    .in('status', ['pending', 'in_progress']);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const notifications: Array<{
    user_id: string;
    channel: string;
    status: string;
    payload: Record<string, string>;
  }> = [];

  let reminders = 0;
  let escalations = 0;

  for (const row of (tasks ?? []) as TaskRow[]) {
    if (!row.due_at) continue;
    const templateTask = Array.isArray(row.template_tasks)
      ? row.template_tasks[0]
      : row.template_tasks;
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const title = templateTask?.title ?? 'Onboarding task';

    const kind = reminderKind(row.due_at, row.status, now);
    if (kind) {
      reminders += 1;
      notifications.push({
        user_id: row.user_id,
        channel: 'in_app',
        status: 'sent',
        payload: {
          title: kind === 'day_before' ? 'Task due tomorrow' : kind === 'due_today' ? 'Task due today' : 'Task overdue',
          body: `"${title}" compliance reminder (${kind}).`,
          type: 'compliance_reminder',
          link: '/checklist',
        },
      });
    }

    const level = escalationLevel(row.due_at, row.status, now);
    if (level === 'manager' && profile?.manager_id) {
      escalations += 1;
      notifications.push({
        user_id: profile.manager_id,
        channel: 'in_app',
        status: 'sent',
        payload: {
          title: 'Direct report task overdue',
          body: `"${title}" is overdue for a team member.`,
          type: 'compliance_escalation',
          link: '/team-progress',
        },
      });
    }

    if (level === 'hr') {
      for (const hrId of hrIds) {
        escalations += 1;
        notifications.push({
          user_id: hrId,
          channel: 'in_app',
          status: 'sent',
          payload: {
            title: 'Compliance escalation',
            body: `"${title}" requires HR follow-up (3+ days overdue).`,
            type: 'compliance_escalation',
            link: '/analytics',
          },
        });
      }
    }
  }

  if (notifications.length > 0) {
    const { error: insertError } = await supabase.from('notifications').insert(notifications);
    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
    }
  }

  return new Response(
    JSON.stringify({
      scanned: (tasks ?? []).length,
      reminders,
      escalations,
      notificationsCreated: notifications.length,
      ranAt: now.toISOString(),
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
