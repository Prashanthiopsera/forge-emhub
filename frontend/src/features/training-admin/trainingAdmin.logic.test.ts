import { describe, expect, it } from 'vitest';
import {
  parseVideoEmbedUrl,
  validateModuleDraft,
  validateQuizQuestionDraft,
  validateVideoEmbedUrl,
} from '@/features/training-admin/trainingAdmin.logic';

describe('trainingAdmin.logic (WO-018)', () => {
  it('parses Vimeo and Wistia embed URLs', () => {
    expect(parseVideoEmbedUrl('https://player.vimeo.com/video/76979871')).toEqual({
      provider: 'vimeo',
      externalId: '76979871',
    });
    expect(parseVideoEmbedUrl('https://fast.wistia.net/embed/iframe/delib3hsz3')).toEqual({
      provider: 'wistia',
      externalId: 'delib3hsz3',
    });
    expect(parseVideoEmbedUrl('https://example.com/video')).toBeNull();
  });

  it('rejects disallowed video hosts', () => {
    expect(validateVideoEmbedUrl('https://youtube.com/watch?v=abc')).toMatch(/Vimeo or Wistia/);
  });

  it('validates module and quiz drafts', () => {
    expect(
      validateModuleDraft({
        title: 'Security',
        description: 'Intro',
        category: 'IT Setup',
        videoUrl: 'https://player.vimeo.com/video/123',
        durationSeconds: 300,
        required: true,
        displayOrder: 1,
      }),
    ).toBeNull();

    expect(
      validateQuizQuestionDraft({
        prompt: 'Enable MFA?',
        choices: ['Yes', 'No'],
        correctIndex: 0,
        sortOrder: 1,
      }),
    ).toBeNull();
  });
});
