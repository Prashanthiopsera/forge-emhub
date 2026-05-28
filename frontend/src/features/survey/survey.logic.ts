const SURVEY_DAY = 30;

export function shouldShowSurvey(startDate: string | null, now = new Date()): boolean {
  if (!startDate) return false;
  const start = new Date(startDate);
  const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  return days >= SURVEY_DAY;
}

export function averageSatisfaction(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

export type SurveyForm = {
  satisfactionScore: number;
  wentWell: string;
  couldImprove: string;
  wouldRecommend: number;
};

export function validateSurveyForm(form: SurveyForm): string | null {
  if (form.satisfactionScore < 1 || form.satisfactionScore > 5) {
    return 'Satisfaction must be between 1 and 5';
  }
  if (form.wouldRecommend < 0 || form.wouldRecommend > 10) {
    return 'Recommendation score must be 0–10';
  }
  return null;
}
