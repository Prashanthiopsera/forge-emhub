export interface QuizChoice {
  label: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  sortOrder: number;
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  passScore: number;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  score: number;
  passed: boolean;
  attemptedAt: string;
}

export interface QuizData {
  quiz: Quiz;
  latestAttempt: QuizAttempt | null;
  source: 'supabase' | 'fixture';
}

export type QuizAnswers = Record<string, number>;
