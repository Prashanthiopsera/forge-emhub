import { useCallback, useEffect, useState } from 'react';
import { buildTemplatesFixture } from '@/features/templates/templates.fixtures';
import {
  reorderTemplateTasks,
  sortTemplateTasks,
  validateTaskDraft,
  validateTemplateDraft,
} from '@/features/templates/templates.logic';
import type {
  OnboardingTemplate,
  TaskDraft,
  TemplateDraft,
  TemplateTask,
  TemplatesData,
} from '@/features/templates/templates.types';
import { getSupabase } from '@/lib/supabase';

interface TemplateRow {
  id: string;
  name: string;
  target_role: string | null;
  target_department: string | null;
  active: boolean;
}

interface TaskRow {
  id: string;
  template_id: string;
  title: string;
  phase_name: string;
  sort_order: number;
  auto_complete: boolean;
  auto_complete_event: string | null;
  required: boolean;
}

function mapTask(row: TaskRow): TemplateTask {
  return {
    id: row.id,
    templateId: row.template_id,
    title: row.title,
    phaseName: row.phase_name,
    sortOrder: row.sort_order,
    autoComplete: row.auto_complete,
    autoCompleteEvent: row.auto_complete_event,
    required: row.required,
  };
}

function mapTemplate(row: TemplateRow, tasks: TemplateTask[]): OnboardingTemplate {
  return {
    id: row.id,
    name: row.name,
    targetRole: row.target_role,
    targetDepartment: row.target_department,
    active: row.active,
    tasks: sortTemplateTasks(tasks),
  };
}

export async function fetchTemplatesFromSupabase(): Promise<TemplatesData | null> {
  const supabase = getSupabase();

  const { data: templateRows, error: templateError } = await supabase
    .from('onboarding_templates')
    .select('id, name, target_role, target_department, active')
    .order('name');

  if (templateError || !templateRows) return null;

  const { data: taskRows, error: taskError } = await supabase
    .from('template_tasks')
    .select('id, template_id, title, phase_name, sort_order, auto_complete, auto_complete_event, required')
    .order('sort_order');

  if (taskError || !taskRows) return null;

  const tasksByTemplate = new Map<string, TemplateTask[]>();
  for (const row of taskRows as TaskRow[]) {
    const mapped = mapTask(row);
    const list = tasksByTemplate.get(mapped.templateId) ?? [];
    list.push(mapped);
    tasksByTemplate.set(mapped.templateId, list);
  }

  const templates = (templateRows as TemplateRow[]).map((row) =>
    mapTemplate(row, tasksByTemplate.get(row.id) ?? []),
  );

  return { templates, source: 'supabase' };
}

export function useTemplates() {
  const [data, setData] = useState<TemplatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const remote = await fetchTemplatesFromSupabase();
      if (remote) {
        setData(remote);
        setSelectedId((current) => current ?? remote.templates[0]?.id ?? null);
        return;
      }
      const fixture = buildTemplatesFixture();
      setData(fixture);
      setSelectedId((current) => current ?? fixture.templates[0]?.id ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load templates';
      setError(message);
      const fixture = buildTemplatesFixture();
      setData(fixture);
      setSelectedId((current) => current ?? fixture.templates[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateLocalTemplate = useCallback((template: OnboardingTemplate) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        templates: prev.templates.map((item) => (item.id === template.id ? template : item)),
      };
    });
  }, []);

  const createTemplate = useCallback(
    async (draft: TemplateDraft) => {
      const validation = validateTemplateDraft(draft);
      if (validation) return { error: validation };

      setSaving(true);
      try {
        const supabase = getSupabase();
        const { data: row, error: insertError } = await supabase
          .from('onboarding_templates')
          .insert({
            name: draft.name.trim(),
            target_role: draft.targetRole || null,
            target_department: draft.targetDepartment || null,
            active: draft.active,
          })
          .select('id, name, target_role, target_department, active')
          .single();

        if (insertError || !row) {
          if (data?.source === 'fixture') {
            const id = crypto.randomUUID();
            const withId: OnboardingTemplate = {
              id,
              name: draft.name.trim(),
              targetRole: draft.targetRole || null,
              targetDepartment: draft.targetDepartment || null,
              active: draft.active,
              tasks: [],
            };
            setData((prev) =>
              prev
                ? { ...prev, templates: [...prev.templates, withId] }
                : { templates: [withId], source: 'fixture' },
            );
            setSelectedId(id);
            return { error: null };
          }
          return { error: insertError?.message ?? 'Failed to create template' };
        }

        const created = mapTemplate(row as TemplateRow, []);
        setData((prev) =>
          prev
            ? { ...prev, templates: [...prev.templates, created], source: 'supabase' }
            : { templates: [created], source: 'supabase' },
        );
        setSelectedId(created.id);
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Failed to create template' };
      } finally {
        setSaving(false);
      }
    },
    [data?.source],
  );

  const saveTemplate = useCallback(
    async (template: OnboardingTemplate, draft: TemplateDraft) => {
      const validation = validateTemplateDraft(draft);
      if (validation) return { error: validation };

      setSaving(true);
      try {
        const supabase = getSupabase();
        const { error: updateError } = await supabase
          .from('onboarding_templates')
          .update({
            name: draft.name.trim(),
            target_role: draft.targetRole || null,
            target_department: draft.targetDepartment || null,
            active: draft.active,
          })
          .eq('id', template.id);

        if (updateError && data?.source !== 'fixture') {
          return { error: updateError.message };
        }

        updateLocalTemplate({
          ...template,
          name: draft.name.trim(),
          targetRole: draft.targetRole || null,
          targetDepartment: draft.targetDepartment || null,
          active: draft.active,
        });
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Failed to save template' };
      } finally {
        setSaving(false);
      }
    },
    [data?.source, updateLocalTemplate],
  );

  const deleteTemplate = useCallback(
    async (templateId: string) => {
      setSaving(true);
      try {
        const supabase = getSupabase();
        const { error: deleteError } = await supabase
          .from('onboarding_templates')
          .delete()
          .eq('id', templateId);

        if (deleteError && data?.source !== 'fixture') {
          return { error: deleteError.message };
        }

        setData((prev) => {
          if (!prev) return prev;
          const templates = prev.templates.filter((item) => item.id !== templateId);
          setSelectedId(templates[0]?.id ?? null);
          return { ...prev, templates };
        });
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Failed to delete template' };
      } finally {
        setSaving(false);
      }
    },
    [data?.source],
  );

  const addTask = useCallback(
    async (templateId: string, draft: TaskDraft) => {
      const validation = validateTaskDraft(draft.title);
      if (validation) return { error: validation };

      const template = data?.templates.find((item) => item.id === templateId);
      if (!template) return { error: 'Template not found' };

      const sortOrder = template.tasks.length + 1;
      setSaving(true);

      try {
        const supabase = getSupabase();
        const { data: row, error: insertError } = await supabase
          .from('template_tasks')
          .insert({
            template_id: templateId,
            title: draft.title.trim(),
            phase_name: draft.phaseName || 'Week 1',
            sort_order: sortOrder,
            auto_complete: draft.autoComplete,
            auto_complete_event: draft.autoCompleteEvent || null,
            required: draft.required,
          })
          .select('id, template_id, title, phase_name, sort_order, auto_complete, auto_complete_event, required')
          .single();

        if (insertError || !row) {
          if (data?.source === 'fixture') {
            const task: TemplateTask = {
              id: crypto.randomUUID(),
              templateId,
              title: draft.title.trim(),
              phaseName: draft.phaseName || 'Week 1',
              sortOrder,
              autoComplete: draft.autoComplete,
              autoCompleteEvent: draft.autoCompleteEvent || null,
              required: draft.required,
            };
            updateLocalTemplate({ ...template, tasks: [...template.tasks, task] });
            return { error: null };
          }
          return { error: insertError?.message ?? 'Failed to add task' };
        }

        updateLocalTemplate({
          ...template,
          tasks: [...template.tasks, mapTask(row as TaskRow)],
        });
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Failed to add task' };
      } finally {
        setSaving(false);
      }
    },
    [data, updateLocalTemplate],
  );

  const deleteTask = useCallback(
    async (templateId: string, taskId: string) => {
      const template = data?.templates.find((item) => item.id === templateId);
      if (!template) return { error: 'Template not found' };

      setSaving(true);
      try {
        const supabase = getSupabase();
        const { error: deleteError } = await supabase.from('template_tasks').delete().eq('id', taskId);

        if (deleteError && data?.source !== 'fixture') {
          return { error: deleteError.message };
        }

        updateLocalTemplate({
          ...template,
          tasks: template.tasks.filter((task) => task.id !== taskId),
        });
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Failed to delete task' };
      } finally {
        setSaving(false);
      }
    },
    [data, updateLocalTemplate],
  );

  const persistTaskOrder = useCallback(
    async (templateId: string, tasks: TemplateTask[]) => {
      const template = data?.templates.find((item) => item.id === templateId);
      if (!template) return;

      updateLocalTemplate({ ...template, tasks });

      if (data?.source === 'fixture') return;

      const supabase = getSupabase();
      await Promise.all(
        tasks.map((task) =>
          supabase.from('template_tasks').update({ sort_order: task.sortOrder }).eq('id', task.id),
        ),
      );
    },
    [data, updateLocalTemplate],
  );

  const reorderTasks = useCallback(
    (templateId: string, fromIndex: number, toIndex: number) => {
      const template = data?.templates.find((item) => item.id === templateId);
      if (!template) return;

      const reordered = reorderTemplateTasks(template.tasks, fromIndex, toIndex);
      void persistTaskOrder(templateId, reordered);
    },
    [data?.templates, persistTaskOrder],
  );

  return {
    data,
    loading,
    error,
    saving,
    selectedId,
    setSelectedId,
    load,
    createTemplate,
    saveTemplate,
    deleteTemplate,
    addTask,
    deleteTask,
    reorderTasks,
  };
}
