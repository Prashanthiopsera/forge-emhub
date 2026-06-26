import { mergeModuleProgress } from '@/features/training/training.logic';
import type { TrainingCatalogData, TrainingModule } from '@/features/training/training.types';

export const ALEX_USER_ID = 'a1000000-0000-4000-8000-000000000001';

export const TRAINING_MODULE_FIXTURES: TrainingModule[] = [
  {
    id: 'e1000000-0000-4000-8000-000000000001',
    title: 'Welcome to Our Culture',
    description: 'Learn about our mission, values, and how teams collaborate across the company.',
    category: 'Company Culture',
    videoProvider: 'vimeo',
    videoExternalId: '76979871',
    durationSeconds: 600,
    required: true,
  },
  {
    id: 'e1000000-0000-4000-8000-000000000002',
    title: 'Secure Your Workspace',
    description: 'Set up MFA, device encryption, and safe handling of company data.',
    category: 'IT Setup',
    videoProvider: 'wistia',
    videoExternalId: 'delib3hsz3',
    durationSeconds: 480,
    required: true,
  },
  {
    id: 'e1000000-0000-4000-8000-000000000003',
    title: 'Workplace Policies',
    description: 'Review code of conduct, PTO, and reporting expectations.',
    category: 'Policies',
    videoProvider: 'vimeo',
    videoExternalId: '148751763',
    durationSeconds: 720,
    required: true,
  },
  {
    id: 'e1000000-0000-4000-8000-000000000004',
    title: 'Role Essentials for Engineers',
    description: 'Development workflow, code review norms, and on-call basics.',
    category: 'Role-Specific',
    videoProvider: 'wistia',
    videoExternalId: '5qxpj8z2lc',
    durationSeconds: 540,
    required: true,
  },
  {
    id: 'e1000000-0000-4000-8000-000000000005',
    title: 'Diversity & Inclusion',
    description: 'Building an inclusive team culture and allyship in daily work.',
    category: 'Company Culture',
    videoProvider: 'vimeo',
    videoExternalId: '357126023',
    durationSeconds: 360,
    required: false,
  },
];

export function buildTrainingFixture(userId = ALEX_USER_ID): TrainingCatalogData {
  const progressByUser: Record<string, { moduleId: string; watchedSeconds: number; completed: boolean }[]> =
    {
      [ALEX_USER_ID]: [
        { moduleId: 'e1000000-0000-4000-8000-000000000001', watchedSeconds: 600, completed: true },
        { moduleId: 'e1000000-0000-4000-8000-000000000002', watchedSeconds: 240, completed: false },
        { moduleId: 'e1000000-0000-4000-8000-000000000003', watchedSeconds: 72, completed: false },
      ],
    };

  const progress = progressByUser[userId] ?? [];

  return {
    modules: mergeModuleProgress(TRAINING_MODULE_FIXTURES, progress),
    source: 'fixture',
  };
}
