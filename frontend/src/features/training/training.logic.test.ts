import { describe, expect, it } from 'vitest';
import { TRAINING_MODULE_FIXTURES } from '@/features/training/training.fixtures';
import {
  buildEmbedUrl,
  completionPercent,
  filterModulesByCategory,
  isVideoCompleted,
  mergeModuleProgress,
  nextProgressSeconds,
} from '@/features/training/training.logic';

describe('training.logic (WO-016)', () => {
  it('marks completion at 90% threshold', () => {
    expect(isVideoCompleted(539, 600)).toBe(false);
    expect(isVideoCompleted(540, 600)).toBe(true);
    expect(isVideoCompleted(647, 720)).toBe(false);
    expect(isVideoCompleted(648, 720)).toBe(true);
  });

  it('builds Vimeo and Wistia embed URLs with resume offset', () => {
    expect(buildEmbedUrl('vimeo', '76979871', 120)).toBe(
      'https://player.vimeo.com/video/76979871?t=120',
    );
    expect(buildEmbedUrl('wistia', 'delib3hsz3', 45)).toBe(
      'https://fast.wistia.net/embed/iframe/delib3hsz3?time=45',
    );
    expect(buildEmbedUrl('unknown', 'abc')).toBe('');
  });

  it('filters modules by category', () => {
    const modules = mergeModuleProgress(TRAINING_MODULE_FIXTURES, []);
    const culture = filterModulesByCategory(modules, 'Company Culture');
    expect(culture).toHaveLength(2);
    expect(culture.every((module) => module.category === 'Company Culture')).toBe(true);
  });

  it('computes completion percent and next progress tick', () => {
    expect(completionPercent(240, 480)).toBe(50);
    expect(nextProgressSeconds(100, 480, 15)).toBe(115);
    expect(nextProgressSeconds(470, 480, 15)).toBe(480);
  });
});
