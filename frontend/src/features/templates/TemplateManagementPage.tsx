import { useEffect, useMemo, useState } from 'react';
import { emptyTemplateDraft, findTemplateById } from '@/features/templates/templates.logic';
import type { TaskDraft, TemplateDraft } from '@/features/templates/templates.types';
import { TemplatePreview } from '@/features/templates/TemplatePreview';
import { useTemplates } from '@/features/templates/useTemplates';

const PHASE_OPTIONS = ['Day 1', 'Week 1', 'Month 1'];

function emptyTaskDraft(): TaskDraft {
  return {
    title: '',
    phaseName: 'Week 1',
    required: true,
    autoComplete: false,
    autoCompleteEvent: '',
  };
}

export function TemplateManagementPage() {
  const {
    data,
    loading,
    error,
    saving,
    selectedId,
    setSelectedId,
    createTemplate,
    saveTemplate,
    deleteTemplate,
    addTask,
    deleteTask,
    reorderTasks,
  } = useTemplates();

  const selected = useMemo(
    () => findTemplateById(data?.templates ?? [], selectedId),
    [data?.templates, selectedId],
  );

  const [draft, setDraft] = useState<TemplateDraft>(emptyTemplateDraft());
  const [taskDraft, setTaskDraft] = useState<TaskDraft>(emptyTaskDraft());
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;
    setDraft({
      name: selected.name,
      targetRole: selected.targetRole ?? 'employee',
      targetDepartment: selected.targetDepartment ?? '',
      active: selected.active,
    });
  }, [selected]);

  if (loading) {
    return <p className="text-sm text-slate-600">Loading templates…</p>;
  }

  if (!data) {
    return <p className="text-sm text-slate-600">Unable to load templates.</p>;
  }

  async function handleCreateTemplate() {
    setFormError(null);
    const result = await createTemplate(draft);
    if (result.error) setFormError(result.error);
    else setDraft(emptyTemplateDraft());
  }

  async function handleSaveTemplate() {
    if (!selected) return;
    setFormError(null);
    const result = await saveTemplate(selected, draft);
    if (result.error) setFormError(result.error);
  }

  async function handleDeleteTemplate() {
    if (!selected || !window.confirm(`Delete template "${selected.name}"?`)) return;
    setFormError(null);
    const result = await deleteTemplate(selected.id);
    if (result.error) setFormError(result.error);
  }

  async function handleAddTask() {
    if (!selected) return;
    setFormError(null);
    const result = await addTask(selected.id, taskDraft);
    if (result.error) setFormError(result.error);
    else setTaskDraft(emptyTaskDraft());
  }

  return (
    <section aria-labelledby="templates-title" className="space-y-6">
      <header>
        <h1 id="templates-title" className="text-2xl font-semibold text-slate-900">
          HR Template Management
        </h1>
        <p className="mt-1 text-slate-600">
          Create and maintain onboarding templates and task definitions.
        </p>
        {error ? (
          <p className="mt-2 text-sm text-amber-700" role="status">
            Showing cached demo data ({error}).
          </p>
        ) : null}
        {data.source === 'fixture' && !error ? (
          <p className="mt-2 text-sm text-slate-500" role="status">
            Showing demo template data.
          </p>
        ) : null}
        {formError ? (
          <p className="mt-2 text-sm text-red-700" role="alert">
            {formError}
          </p>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {data.templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedId(template.id)}
                className={[
                  'rounded-md border px-3 py-1.5 text-sm font-medium',
                  selected?.id === template.id
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
                ].join(' ')}
              >
                {template.name}
              </button>
            ))}
          </div>

          {selected ? (
            <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-lg font-semibold text-slate-900">Edit template</h2>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Name</span>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Target role</span>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                  value={draft.targetRole}
                  onChange={(event) => setDraft({ ...draft, targetRole: event.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Target department</span>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                  value={draft.targetDepartment}
                  onChange={(event) => setDraft({ ...draft, targetDepartment: event.target.value })}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(event) => setDraft({ ...draft, active: event.target.checked })}
                />
                <span className="font-medium text-slate-700">Active</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleSaveTemplate()}
                  className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  Save template
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleDeleteTemplate()}
                  className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-sm font-semibold text-slate-900">Tasks (drag to reorder)</h3>
                <ul className="mt-2 space-y-2">
                  {selected.tasks.map((task, index) => (
                    <li
                      key={task.id}
                      draggable
                      onDragStart={() => setDragIndex(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (dragIndex !== null) reorderTasks(selected.id, dragIndex, index);
                        setDragIndex(null);
                      }}
                      className="flex cursor-grab items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    >
                      <span>
                        {task.title}
                        <span className="ml-2 text-xs text-slate-500">{task.phaseName}</span>
                      </span>
                      <button
                        type="button"
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => void deleteTask(selected.id, task.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <input
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="New task title"
                    value={taskDraft.title}
                    onChange={(event) => setTaskDraft({ ...taskDraft, title: event.target.value })}
                  />
                  <select
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={taskDraft.phaseName}
                    onChange={(event) => setTaskDraft({ ...taskDraft, phaseName: event.target.value })}
                  >
                    {PHASE_OPTIONS.map((phase) => (
                      <option key={phase} value={phase}>
                        {phase}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleAddTask()}
                  className="mt-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Add task
                </button>
              </div>
            </div>
          ) : null}

          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900">New template</h2>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Template name"
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleCreateTemplate()}
              className="mt-2 rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-900"
            >
              Create template
            </button>
          </div>
        </div>

        {selected ? <TemplatePreview template={selected} /> : null}
      </div>
    </section>
  );
}
