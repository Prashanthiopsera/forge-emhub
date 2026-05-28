import { describe, expect, it } from 'vitest';
import { SECURITY_QUIZ_FIXTURE } from '@/features/training/quiz.fixtures';
import {
  calculateQuizScore,
  hasPassedQuiz,
  isQuizAnswered,
} from '@/features/training/quiz.logic';

describe('quiz.logic (WO-017)', () => {
  const questions = SECURITY_QUIZ_FIXTURE.questions;

  it('calculates score from correct answers', () => {
    const answers = {
      [questions[0].id]: 0,
      [questions[1].id]: 1,
      [questions[2].id]: 0,
    };
    expect(calculateQuizScore(questions, answers)).toBe(100);
  });

  it('detects partial scores and pass threshold', () => {
    const answers = {
      [questions[0].id]: 0,
      [questions[1].id]: 0,
      [questions[2].id]: 0,
    };
    const score = calculateQuizScore(questions, answers);
    expect(score).toBe(67);
    expect(hasPassedQuiz(score, 80)).toBe(false);
    expect(hasPassedQuiz(80, 80)).toBe(true);
  });

  it('requires every question to be answered before submit', () => {
    expect(isQuizAnswered(questions, { [questions[0].id]: 0 })).toBe(false);
    expect(
      isQuizAnswered(questions, {
        [questions[0].id]: 0,
        [questions[1].id]: 1,
        [questions[2].id]: 0,
      }),
    ).toBe(true);
  });
});
