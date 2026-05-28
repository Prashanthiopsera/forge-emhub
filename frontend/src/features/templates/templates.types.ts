export interface TemplateTask {
  id: string;
  templateId: string;
  title: string;
  phaseName: string;
  sortOrder: number;
  autoComplete: boolean;
  autoCompleteEvent: string | null;
  required: boolean;
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  targetRole: string | null;
  targetDepartment: string | null;
  active: boolean;
  tasks: TemplateTask[];
}

export interface TemplatesData {
  templates: OnboardingTemplate[];
  source: 'supabase' | 'fixture';
}

export interface TemplateDraft {
  name: string;
  targetRole: string;
  targetDepartment: string;
  active: boolean;
}

export interface TaskDraft {
  title: string;
  phaseName: string;
  required: boolean;
  autoComplete: boolean;
  autoCompleteEvent: string;
}
