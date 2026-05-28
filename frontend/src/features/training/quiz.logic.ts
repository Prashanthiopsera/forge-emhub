import type { Quiz, QuizAnswers, QuizQuestion } from '@/features/training/quiz.types';

export function calculateQuizScore(questions: QuizQuestion[], answers: QuizAnswers): number {
  if (questions.length === 0) return 0;

  const correct = questions.filter((question) => answers[question.id] === question.correctIndex).length;
  return Math.round((correct / questions.length) * 100);
}

export function hasPassedQuiz(score: number, passScore: number): boolean {
  return score >= passScore;
}

export function isQuizAnswered(questions: QuizQuestion[], answers: QuizAnswers): boolean {
  return questions.every(
    (question) =>
      typeof answers[question.id] === 'number' &&
      answers[question.id] >= 0 &&
      answers[question.id] < question.choices.length,
  );
}

export function findQuizByModuleId(quizzes: Quiz[], moduleId: string): Quiz | null {
  return quizzes.find((quiz) => quiz.moduleId === moduleId) ?? null;
}
