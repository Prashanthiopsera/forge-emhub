import type { Quiz, QuizData } from '@/features/training/quiz.types';

export const SECURITY_MODULE_ID = 'e1000000-0000-4000-8000-000000000002';
export const SECURITY_QUIZ_ID = '91000000-0000-4000-8000-000000000001';

export const SECURITY_QUIZ_FIXTURE: Quiz = {
  id: SECURITY_QUIZ_ID,
  moduleId: SECURITY_MODULE_ID,
  title: 'Security Training Quiz',
  passScore: 80,
  questions: [
    {
      id: '91100000-0000-4000-8000-000000000001',
      prompt: 'What should you enable on all company devices?',
      choices: ['MFA', 'Guest Wi-Fi sharing', 'Public file sync'],
      correctIndex: 0,
      sortOrder: 1,
    },
    {
      id: '91100000-0000-4000-8000-000000000002',
      prompt: 'How should you handle sensitive customer data?',
      choices: [
        'Store in personal cloud drives',
        'Encrypt at rest and in transit',
        'Share via public links',
      ],
      correctIndex: 1,
      sortOrder: 2,
    },
    {
      id: '91100000-0000-4000-8000-000000000003',
      prompt: 'Who should you contact if you suspect a phishing email?',
      choices: ['IT Operations', 'Any external vendor', 'No one — ignore it'],
      correctIndex: 0,
      sortOrder: 3,
    },
  ],
};

export function buildQuizFixture(moduleId: string): QuizData | null {
  if (moduleId !== SECURITY_MODULE_ID) return null;
  return { quiz: SECURITY_QUIZ_FIXTURE, latestAttempt: null, source: 'fixture' };
}
