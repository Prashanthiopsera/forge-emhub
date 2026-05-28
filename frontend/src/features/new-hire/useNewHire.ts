import { useCallback, useEffect, useState } from 'react';
import {
  buildTaskProgressDrafts,
  matchOnboardingTemplate,
  validateNewHireForm,
  type NewHireFormValues,
  type OnboardingTemplateMatch,
} from '@/features/new-hire/newHire.logic';
import { getSupabase } from '@/lib/supabase';

const EMPTY_FORM: NewHireFormValues = {
  fullName: '',
  email: '',
  role: 'employee',
  departmentId: '',
  managerId: '',
  startDate: '',
  jobTitle: '',
  photoUrl: '',
};

export interface CreatedNewHire {
  userId: string;
  planId: string;
  tasksCreated: number;
  templateName: string;
}

export function useNewHire() {
  const [form, setForm] = useState<NewHireFormValues>(EMPTY_FORM);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [managers, setManagers] = useState<{ id: string; fullName: string }[]>([]);
  const [templates, setTemplates] = useState<OnboardingTemplateMatch[]>([]);
  const [existingEmails, setExistingEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedNewHire | null>(null);
  const [source, setSource] = useState<'supabase' | 'fixture'>('fixture');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabase();
      const [{ data: deptRows }, { data: managerRows }, { data: templateRows }, { data: profileRows }] =
        await Promise.all([
          supabase.from('departments').select('id, name').order('name'),
          supabase
            .from('profiles')
            .select('id, full_name')
            .eq('role', 'manager')
            .is('deleted_at', null),
          supabase
            .from('onboarding_templates')
            .select('id, name, target_role, target_department, active')
            .eq('active', true),
          supabase.from('profiles').select('email'),
        ]);

      if (!deptRows || !templateRows) throw new Error('Failed to load reference data');

      setDepartments(deptRows as { id: string; name: string }[]);
      setManagers(
        ((managerRows ?? []) as { id: string; full_name: string }[]).map((row) => ({
          id: row.id,
          fullName: row.full_name,
        })),
      );
      setTemplates(
        (templateRows as OnboardingTemplateMatch[]).map((row) => ({
          id: row.id,
          name: (row as { name: string }).name,
          targetRole: row.target_role ?? null,
          targetDepartment: row.target_department ?? null,
        })),
      );
      setExistingEmails(((profileRows ?? []) as { email: string }[]).map((p) => p.email));
      setSource('supabase');
    } catch {
      setDepartments([
        { id: 'd1000000-0000-4000-8000-000000000001', name: 'Engineering' },
        { id: 'd1000000-0000-4000-8000-000000000004', name: 'Platform' },
      ]);
      setManagers([{ id: 'u1000000-0000-4000-8000-000000000010', fullName: 'Morgan Blake' }]);
      setTemplates([
        {
          id: 't1000000-0000-4000-8000-000000000001',
          name: 'Engineering IC — Standard',
          targetRole: 'employee',
          targetDepartment: 'Engineering',
        },
        {
          id: 't1000000-0000-4000-8000-000000000003',
          name: 'All Departments — Day 1 Essentials',
          targetRole: 'employee',
          targetDepartment: null,
        },
      ]);
      setExistingEmails(['alex.newhire@emhub.local']);
      setSource('fixture');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedDepartment = departments.find((d) => d.id === form.departmentId);
  const matchedTemplate = matchOnboardingTemplate(
    templates,
    form.role,
    selectedDepartment?.name ?? null,
  );

  const submit = useCallback(async () => {
    const validationError = validateNewHireForm(form, existingEmails);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!matchedTemplate) {
      setError('No matching onboarding template for role and department');
      return;
    }

    setSubmitting(true);
    setError(null);
    setCreated(null);

    try {
      if (source === 'fixture') {
        const userId = crypto.randomUUID();
        const planId = crypto.randomUUID();
        const taskDrafts = buildTaskProgressDrafts(
          [
            { id: 'tt100000-0000-4000-8000-00000000001', dueDateOffsetDays: 0 },
            { id: 'tt100000-0000-4000-8000-00000000002', dueDateOffsetDays: 7 },
          ],
          form.startDate,
        );
        setCreated({
          userId,
          planId,
          tasksCreated: taskDrafts.length,
          templateName: matchedTemplate.name,
        });
        return;
      }

      const supabase = getSupabase();
      const { data, error: fnError } = await supabase.functions.invoke('new-hire-onboard', {
        body: {
          fullName: form.fullName,
          email: form.email,
          role: form.role,
          departmentId: form.departmentId,
          managerId: form.managerId || null,
          startDate: form.startDate,
          jobTitle: form.jobTitle || null,
          photoUrl: form.photoUrl || null,
          templateId: matchedTemplate.id,
        },
      });

      if (fnError) throw fnError;
      const result = data as {
        userId: string;
        planId: string;
        tasksCreated: number;
      };

      setCreated({
        userId: result.userId,
        planId: result.planId,
        tasksCreated: result.tasksCreated,
        templateName: matchedTemplate.name,
      });
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create new hire');
    } finally {
      setSubmitting(false);
    }
  }, [existingEmails, form, matchedTemplate, source]);

  return {
    form,
    setForm,
    departments,
    managers,
    matchedTemplate,
    loading,
    submitting,
    error,
    created,
    source,
    submit,
  };
}
