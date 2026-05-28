import type { OnboardingTemplate, TemplateDraft, TemplateTask } from '@/features/templates/templates.types';

export function reorderTemplateTasks(
  tasks: TemplateTask[],
  fromIndex: number,
  toIndex: number,
): TemplateTask[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return tasks;
  if (fromIndex >= tasks.length || toIndex >= tasks.length) return tasks;

  const next = [...tasks];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);

  return next.map((task, index) => ({
    ...task,
    sortOrder: index + 1,
  }));
}

export function sortTemplateTasks(tasks: TemplateTask[]): TemplateTask[] {
  return [...tasks].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function validateTemplateDraft(draft: TemplateDraft): string | null {
  if (!draft.name.trim()) return 'Template name is required';
  return null;
}

export function validateTaskDraft(title: string): string | null {
  if (!title.trim()) return 'Task title is required';
  return null;
}

export function findTemplateById(
  templates: OnboardingTemplate[],
  id: string | null,
): OnboardingTemplate | null {
  if (!id) return templates[0] ?? null;
  return templates.find((template) => template.id === id) ?? null;
}

export function emptyTemplateDraft(): TemplateDraft {
  return {
    name: '',
    targetRole: 'employee',
    targetDepartment: '',
    active: true,
  };
}
