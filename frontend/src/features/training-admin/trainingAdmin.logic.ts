import type { TrainingCategory } from '@/features/training/training.types';

export interface TrainingModuleDraft {
  id?: string;
  title: string;
  description: string;
  category: TrainingCategory | string;
  videoUrl: string;
  durationSeconds: number;
  required: boolean;
  displayOrder: number;
}

export interface QuizQuestionDraft {
  id?: string;
  quizId?: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  sortOrder: number;
}

export interface ParsedVideoEmbed {
  provider: 'vimeo' | 'wistia';
  externalId: string;
}

const VIMEO_HOSTS = ['vimeo.com', 'player.vimeo.com'];
const WISTIA_HOSTS = ['wistia.com', 'fast.wistia.net', 'fast.wistia.com'];

export function parseVideoEmbedUrl(url: string): ParsedVideoEmbed | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, '');

    if (VIMEO_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) {
      const pathMatch = parsed.pathname.match(/\/(?:video\/)?(\d+)/);
      if (pathMatch?.[1]) {
        return { provider: 'vimeo', externalId: pathMatch[1] };
      }
    }

    if (WISTIA_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) {
      const mediasMatch = parsed.pathname.match(/\/medias\/([a-z0-9]+)/i);
      if (mediasMatch?.[1]) {
        return { provider: 'wistia', externalId: mediasMatch[1] };
      }
      const embedMatch = parsed.pathname.match(/\/embed\/(?:iframe\/)?([a-z0-9]+)/i);
      if (embedMatch?.[1]) {
        return { provider: 'wistia', externalId: embedMatch[1] };
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function validateVideoEmbedUrl(url: string): string | null {
  if (!url.trim()) return 'Video embed URL is required';
  if (!parseVideoEmbedUrl(url)) {
    return 'URL must be a Vimeo or Wistia embed link';
  }
  return null;
}

export function validateModuleDraft(draft: TrainingModuleDraft): string | null {
  if (!draft.title.trim()) return 'Title is required';
  const urlError = validateVideoEmbedUrl(draft.videoUrl);
  if (urlError) return urlError;
  if (draft.durationSeconds <= 0) return 'Duration must be greater than 0';
  return null;
}

export function validateQuizQuestionDraft(draft: QuizQuestionDraft): string | null {
  if (!draft.prompt.trim()) return 'Question prompt is required';
  const filledChoices = draft.choices.map((c) => c.trim()).filter(Boolean);
  if (filledChoices.length < 2) return 'At least two answer options are required';
  if (draft.correctIndex < 0 || draft.correctIndex >= filledChoices.length) {
    return 'Select a valid correct answer';
  }
  return null;
}

export function reorderModules<T extends { displayOrder: number }>(
  modules: T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return modules;
  if (fromIndex >= modules.length || toIndex >= modules.length) return modules;

  const next = [...modules];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);

  return next.map((module, index) => ({
    ...module,
    displayOrder: index + 1,
  }));
}

export function emptyModuleDraft(displayOrder = 1): TrainingModuleDraft {
  return {
    title: '',
    description: '',
    category: 'Company Culture',
    videoUrl: '',
    durationSeconds: 300,
    required: true,
    displayOrder,
  };
}

export function emptyQuizQuestionDraft(sortOrder = 1): QuizQuestionDraft {
  return {
    prompt: '',
    choices: ['', '', ''],
    correctIndex: 0,
    sortOrder,
  };
}
