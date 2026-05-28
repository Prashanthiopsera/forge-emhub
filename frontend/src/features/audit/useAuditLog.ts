import { useCallback, useEffect, useState } from 'react';
import { AUDIT_LOG_FIXTURES } from '@/features/audit/audit.fixtures';
import type { AuditLogEntry } from '@/features/audit/audit.types';
import { getSupabase } from '@/lib/supabase';

function mapRow(row: Record<string, unknown>): AuditLogEntry {
  return {
    id: String(row.id),
    actorUserId: row.actor_user_id ? String(row.actor_user_id) : null,
    eventType: String(row.event_type),
    tableName: String(row.table_name),
    recordId: row.record_id ? String(row.record_id) : null,
    createdAt: String(row.created_at),
    summary: `${row.event_type} on ${row.table_name}`,
  };
}

export function useAuditLog() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'live' | 'fixture'>('fixture');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await getSupabase()
        .from('audit_log')
        .select('id, actor_user_id, event_type, table_name, record_id, created_at')
        .order('created_at', { ascending: false })
        .limit(200);

      if (queryError) throw queryError;
      if (!data?.length) {
        setEntries(AUDIT_LOG_FIXTURES);
        setSource('fixture');
      } else {
        setEntries(data.map((row) => mapRow(row as Record<string, unknown>)));
        setSource('live');
      }
    } catch (err) {
      setEntries(AUDIT_LOG_FIXTURES);
      setSource('fixture');
      setError(err instanceof Error ? err.message : 'Failed to load audit log');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { entries, loading, error, source, reload: load };
}
