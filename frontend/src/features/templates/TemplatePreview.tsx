import type { OnboardingTemplate } from '@/features/templates/templates.types';

interface TemplatePreviewProps {
  template: OnboardingTemplate;
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  const phases = [...new Set(template.tasks.map((task) => task.phaseName))];

  return (
    <aside
      aria-labelledby="template-preview-title"
      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
    >
      <h2 id="template-preview-title" className="text-sm font-semibold text-slate-900">
        Preview
      </h2>
      <p className="mt-1 text-xs text-slate-600">
        {template.targetRole ?? 'Any role'}
        {template.targetDepartment ? ` · ${template.targetDepartment}` : ''}
        {!template.active ? ' · Inactive' : ''}
      </p>
      <ol className="mt-4 space-y-4">
        {phases.map((phase) => (
          <li key={phase}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{phase}</p>
            <ul className="mt-2 space-y-2">
              {template.tasks
                .filter((task) => task.phaseName === phase)
                .map((task) => (
                  <li
                    key={task.id}
                    className="rounded-md border border-white bg-white px-3 py-2 text-sm text-slate-800 shadow-sm"
                  >
                    {task.title}
                    {task.autoComplete ? (
                      <span className="ml-2 text-xs text-brand-600">
                        Auto{task.autoCompleteEvent ? `: ${task.autoCompleteEvent}` : ''}
                      </span>
                    ) : null}
                    {!task.required ? (
                      <span className="ml-2 text-xs text-slate-500">Optional</span>
                    ) : null}
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ol>
      {template.tasks.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No tasks yet — add tasks to preview the checklist.</p>
      ) : null}
    </aside>
  );
}
