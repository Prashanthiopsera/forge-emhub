import { describe, expect, it } from 'vitest';
import {
  emptyTemplateDraft,
  reorderTemplateTasks,
  validateTemplateDraft,
} from '@/features/templates/templates.logic';
import { TEMPLATE_FIXTURES } from '@/features/templates/templates.fixtures';

describe('templates.logic (WO-014)', () => {
  it('reorders tasks and updates sort_order', () => {
    const tasks = TEMPLATE_FIXTURES[0].tasks;
    const reordered = reorderTemplateTasks(tasks, 0, 1);
    expect(reordered[0].title).toBe('Set up development environment');
    expect(reordered[0].sortOrder).toBe(1);
    expect(reordered[1].sortOrder).toBe(2);
  });

  it('validates template name', () => {
    expect(validateTemplateDraft(emptyTemplateDraft())).toBe('Template name is required');
    expect(validateTemplateDraft({ ...emptyTemplateDraft(), name: 'New hire' })).toBeNull();
  });
});
