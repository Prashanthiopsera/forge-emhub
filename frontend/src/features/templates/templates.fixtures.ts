import { sortTemplateTasks } from '@/features/templates/templates.logic';
import type { OnboardingTemplate, TemplatesData } from '@/features/templates/templates.types';

export const TEMPLATE_FIXTURES: OnboardingTemplate[] = [
  {
    id: 't1000000-0000-4000-8000-000000000001',
    name: 'Engineering IC — Standard',
    targetRole: 'employee',
    targetDepartment: 'Engineering',
    active: true,
    tasks: sortTemplateTasks([
      {
        id: 'tt100000-0000-4000-8000-00000000001',
        templateId: 't1000000-0000-4000-8000-000000000001',
        title: 'Complete security training',
        phaseName: 'Day 1',
        sortOrder: 1,
        autoComplete: true,
        autoCompleteEvent: 'video_complete:m1000000-0000-4000-8000-000000000002',
        required: true,
      },
      {
        id: 'tt100000-0000-4000-8000-00000000002',
        templateId: 't1000000-0000-4000-8000-000000000001',
        title: 'Set up development environment',
        phaseName: 'Week 1',
        sortOrder: 2,
        autoComplete: false,
        autoCompleteEvent: null,
        required: true,
      },
    ]),
  },
  {
    id: 't1000000-0000-4000-8000-000000000003',
    name: 'All Departments — Day 1 Essentials',
    targetRole: 'employee',
    targetDepartment: null,
    active: true,
    tasks: sortTemplateTasks([
      {
        id: 'tt100000-0000-4000-8000-00000000003',
        templateId: 't1000000-0000-4000-8000-000000000003',
        title: 'Meet your manager',
        phaseName: 'Day 1',
        sortOrder: 1,
        autoComplete: false,
        autoCompleteEvent: null,
        required: true,
      },
      {
        id: 'tt100000-0000-4000-8000-00000000006',
        templateId: 't1000000-0000-4000-8000-000000000003',
        title: 'Complete product tour',
        phaseName: 'Day 1',
        sortOrder: 2,
        autoComplete: true,
        autoCompleteEvent: 'tour_complete',
        required: false,
      },
    ]),
  },
];

export function buildTemplatesFixture(): TemplatesData {
  return {
    templates: TEMPLATE_FIXTURES,
    source: 'fixture',
  };
}
