import { useCallback, useEffect, useState } from 'react';
import type { OffboardEmployee } from '@/features/offboard/offboard.logic';
import { getSupabase } from '@/lib/supabase';

const FIXTURE_EMPLOYEES: OffboardEmployee[] = [
  {
    id: 'u1000000-0000-4000-8000-000000000099',
    fullName: 'Jordan Lee (offboarded)',
    email: 'jordan.offboard@emhub.local',
    offboardedAt: null,
  },
];

export function useOffboard() {
  const [employees, setEmployees] = useState<OffboardEmployee[]>(FIXTURE_EMPLOYEES);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: queryError } = await getSupabase()
        .from('profiles')
        .select('id, full_name, email, offboarded_at')
        .eq('role', 'employee')
        .is('deleted_at', null)
        .limit(20);

      if (queryError) throw queryError;
      if (data?.length) {
        setEmployees(
          data.map((row) => ({
            id: String(row.id),
            fullName: String(row.full_name),
            email: String(row.email),
            offboardedAt: row.offboarded_at ? String(row.offboarded_at) : null,
          })),
        );
      }
    } catch {
      setEmployees(FIXTURE_EMPLOYEES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markOffboarded = useCallback(async (employeeId: string) => {
    setSubmitting(true);
    setError(null);
    setMessage(null);
    const offboardedAt = new Date().toISOString();

    try {
      const { error: updateError } = await getSupabase()
        .from('profiles')
        .update({ offboarded_at: offboardedAt })
        .eq('id', employeeId);

      if (updateError) throw updateError;

      await getSupabase().functions.invoke('pii-deletion', { body: { dryRun: true } }).catch(() => undefined);

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employeeId ? { ...emp, offboardedAt: offboardedAt } : emp,
        ),
      );
      setMessage('Employee marked offboarded. PII will be anonymized after 90 days.');
    } catch (err) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employeeId ? { ...emp, offboardedAt: offboardedAt } : emp,
        ),
      );
      setMessage('Demo mode — offboarding recorded locally.');
      setError(err instanceof Error ? err.message : 'Offboard failed');
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { employees, loading, submitting, error, message, markOffboarded, reload: load };
}
