/**
 * WO-031: Email and Slack notification delivery stub.
 * Routes critical notifications to email (Resend/SendGrid placeholder) and IT Slack webhooks.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

type DeliveryChannel = 'in_app' | 'email' | 'slack';
type NotificationPreference = 'in_app' | 'email_and_in_app' | 'all';

interface NotificationRow {
  id: string;
  user_id: string;
  channel: string;
  status: string;
  payload: Record<string, string>;
}

const CRITICAL_TYPES = new Set([
  'compliance_reminder',
  'compliance_escalation',
  'provisioning',
  'hr_escalation',
]);

function preferenceAllows(channel: DeliveryChannel, pref: NotificationPreference): boolean {
  if (channel === 'in_app') return true;
  if (pref === 'all') return true;
  if (pref === 'email_and_in_app' && channel === 'email') return true;
  return false;
}

async function deliverEmailStub(to: string, subject: string, body: string): Promise<{ ok: boolean }> {
  console.log(JSON.stringify({ channel: 'email', to, subject, bodyLength: body.length }));
  return { ok: true };
}

async function deliverSlackStub(webhookUrl: string, text: string): Promise<{ ok: boolean }> {
  if (!webhookUrl) {
    console.log(JSON.stringify({ channel: 'slack', skipped: true, reason: 'no webhook' }));
    return { ok: false };
  }
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const slackWebhook = Deno.env.get('SLACK_IT_WEBHOOK_URL') ?? '';
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase env' }), { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const body = (await req.json().catch(() => ({}))) as { notificationId?: string };
  const notificationId = body.notificationId;

  let query = supabase
    .from('notifications')
    .select('id, user_id, channel, status, payload')
    .eq('status', 'pending')
    .limit(50);

  if (notificationId) {
    query = query.eq('id', notificationId);
  }

  const { data: rows, error } = await query;
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let emailSent = 0;
  let slackSent = 0;
  let skipped = 0;

  for (const row of (rows ?? []) as NotificationRow[]) {
    const type = row.payload?.type ?? '';
    if (!CRITICAL_TYPES.has(type) && row.channel === 'in_app') {
      skipped += 1;
      continue;
    }

    const pref: NotificationPreference =
      (row.payload?.preference as NotificationPreference) ?? 'email_and_in_app';

    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', row.user_id)
      .maybeSingle();

    const email = profile?.email ?? row.payload?.email ?? '';
    const subject = row.payload?.title ?? 'Onboarding Hub notification';
    const text = row.payload?.body ?? '';

    if (preferenceAllows('email', pref) && email) {
      const result = await deliverEmailStub(email, subject, text);
      if (result.ok) emailSent += 1;
    }

    if (type === 'provisioning' && preferenceAllows('slack', pref)) {
      const result = await deliverSlackStub(slackWebhook, `[IT] ${subject}: ${text}`);
      if (result.ok) slackSent += 1;
    }

    await supabase.from('notifications').update({ status: 'sent' }).eq('id', row.id);
  }

  return new Response(
    JSON.stringify({
      processed: (rows ?? []).length,
      emailSent,
      slackSent,
      skipped,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
