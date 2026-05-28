import type { CatalogModule, TrainingCategory, TrainingModule, VideoProgress } from '@/features/training/training.types';

export const COMPLETION_THRESHOLD = 0.9;

export function isVideoCompleted(watchedSeconds: number, durationSeconds: number): boolean {
  if (durationSeconds <= 0) return false;
  const threshold = Math.ceil(durationSeconds * COMPLETION_THRESHOLD);
  return watchedSeconds >= threshold;
}

export function completionPercent(watchedSeconds: number, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  return Math.min(100, Math.round((watchedSeconds / durationSeconds) * 100));
}

export function buildEmbedUrl(
  provider: string | null,
  externalId: string | null,
  startSeconds = 0,
): string {
  if (!provider || !externalId) return '';

  const start = Math.max(0, Math.floor(startSeconds));

  if (provider === 'vimeo') {
    return `https://player.vimeo.com/video/${externalId}?t=${start}`;
  }

  if (provider === 'wistia') {
    return `https://fast.wistia.net/embed/iframe/${externalId}?time=${start}`;
  }

  return '';
}

export function filterModulesByCategory(
  modules: CatalogModule[],
  category: TrainingCategory | 'all',
): CatalogModule[] {
  if (category === 'all') return modules;
  return modules.filter((module) => module.category === category);
}

export function mergeModuleProgress(
  modules: TrainingModule[],
  progressRows: VideoProgress[],
): CatalogModule[] {
  const progressByModule = new Map(progressRows.map((row) => [row.moduleId, row]));

  return modules.map((module) => {
    const progress = progressByModule.get(module.id);
    const watchedSeconds = progress?.watchedSeconds ?? 0;
    const completed =
      progress?.completed ?? isVideoCompleted(watchedSeconds, module.durationSeconds);

    return {
      ...module,
      watchedSeconds,
      completed,
    };
  });
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '—';
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} min`;
}

export function nextProgressSeconds(
  currentWatched: number,
  durationSeconds: number,
  incrementSeconds: number,
): number {
  if (durationSeconds <= 0) return currentWatched;
  return Math.min(durationSeconds, currentWatched + incrementSeconds);
}
