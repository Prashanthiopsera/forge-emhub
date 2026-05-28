import { describe, expect, it } from 'vitest';
import {
  averageSatisfaction,
  shouldShowSurvey,
  validateSurveyForm,
} from '@/features/survey/survey.logic';

describe('survey.logic (WO-043)', () => {
  it('shows survey after day 30', () => {
    expect(shouldShowSurvey('2026-04-01', new Date('2026-05-01'))).toBe(true);
    expect(shouldShowSurvey('2026-05-01', new Date('2026-05-15'))).toBe(false);
  });

  it('validates and averages scores', () => {
    expect(
      validateSurveyForm({
        satisfactionScore: 4,
        wentWell: 'Great',
        couldImprove: '',
        wouldRecommend: 9,
      }),
    ).toBeNull();
    expect(averageSatisfaction([4, 5, 3])).toBe(4);
  });
});
