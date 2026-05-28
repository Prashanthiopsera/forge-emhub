export type VideoProvider = 'vimeo' | 'wistia';

export type TrainingCategory =
  | 'Company Culture'
  | 'IT Setup'
  | 'Policies'
  | 'Role-Specific';

export const TRAINING_CATEGORIES: TrainingCategory[] = [
  'Company Culture',
  'IT Setup',
  'Policies',
  'Role-Specific',
];

export interface TrainingModule {
  id: string;
  title: string;
  description: string | null;
  category: TrainingCategory | string;
  videoProvider: VideoProvider | string | null;
  videoExternalId: string | null;
  durationSeconds: number;
  required: boolean;
}

export interface VideoProgress {
  moduleId: string;
  watchedSeconds: number;
  completed: boolean;
}

export interface CatalogModule extends TrainingModule {
  watchedSeconds: number;
  completed: boolean;
}

export interface TrainingCatalogData {
  modules: CatalogModule[];
  source: 'supabase' | 'fixture';
}
