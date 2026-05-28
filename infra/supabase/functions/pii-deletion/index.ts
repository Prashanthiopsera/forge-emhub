/**
 * WO-035: PII deletion workflow stub — anonymizes profiles 90 days after offboarding.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const RETENTION_DAYS = 90;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const PII_FIELDS = ['full_name', 'email', 'phone', 'photo_url'] as const;

function retentionCutoff(now: Date): string {
  return new Date(now.getTime() - RETENTION_DAYS * MS_PER_DAY).toISOString();
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
  const cutoff = retentionCutoff(now);

  const { data: candidates, error } = await supabase
    .from('profiles')
    .select('id, offboarded_at')
    .not('offboarded_at', 'is', null)
    .lte('offboarded_at', cutoff)
    .is('deleted_at', null);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let anonymized = 0;
  const tablesAffected = ['profiles', 'chat_messages'];

  for (const profile of candidates ?? []) {
    const updates: Record<string, string | null> = {
      full_name: 'REDACTED',
      email: `redacted-${profile.id.slice(0, 8)}@deleted.local`,
      phone: null,
      photo_url: null,
      deleted_at: now.toISOString(),
    };

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (updateError) continue;

    await supabase
      .from('chat_messages')
      .update({ content: '[REDACTED]' })
      .eq('session_id', profile.id);

    await supabase.auth.admin.deleteUser(profile.id).catch(() => undefined);

    await supabase.from('audit_log').insert({
      actor_user_id: null,
      event_type: 'pii_deletion',
      target_entity: 'profiles',
      table_name: 'profiles',
      record_id: profile.id,
      new_values: { tables_affected: tablesAffected, pii_fields: PII_FIELDS },
    });

    anonymized += 1;
  }

  return new Response(
    JSON.stringify({
      scanned: (candidates ?? []).length,
      anonymized,
      retentionDays: RETENTION_DAYS,
      cutoff,
      ranAt: now.toISOString(),
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
