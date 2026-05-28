import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import {
  autoCompleteTask,
  buildQuizPassEvent,
} from '@/features/checklist/autoComplete';
import { buildQuizFixture } from '@/features/training/quiz.fixtures';
import {
  calculateQuizScore,
  hasPassedQuiz,
  isQuizAnswered,
} from '@/features/training/quiz.logic';
import type { QuizAnswers, QuizData } from '@/features/training/quiz.types';
import { getSupabase } from '@/lib/supabase';

interface QuizRow {
  id: string;
  module_id: string;
  title: string;
  pass_score: number;
}

interface QuizQuestionRow {
  id: string;
  prompt: string;
  sort_order: number;
  choices: string[] | null;
  correct_index: number;
}

interface QuizAttemptRow {
  score: number;
  passed: boolean;
  attempted_at: string;
}

export async function fetchQuizForModule(
  moduleId: string,
  userId: string,
): Promise<QuizData | null> {
  const supabase = getSupabase();

  const { data: quizRow, error: quizError } = await supabase
    .from('quizzes')
    .select('id, module_id, title, pass_score')
    .eq('module_id', moduleId)
    .eq('active', true)
    .maybeSingle();

  if (quizError || !quizRow) return null;

  const { data: questionRows, error: questionError } = await supabase
    .from('quiz_questions')
    .select('id, prompt, sort_order, choices, correct_index')
    .eq('quiz_id', quizRow.id)
    .order('sort_order');

  if (questionError || !questionRows?.length) return null;

  const { data: attemptRow } = await supabase
    .from('quiz_attempts')
    .select('score, passed, attempted_at')
    .eq('quiz_id', quizRow.id)
    .eq('user_id', userId)
    .order('attempted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const row = quizRow as QuizRow;

  return {
    quiz: {
      id: row.id,
      moduleId: row.module_id,
      title: row.title,
      passScore: row.pass_score,
      questions: (questionRows as QuizQuestionRow[]).map((question) => ({
        id: question.id,
        prompt: question.prompt,
        sortOrder: question.sort_order,
        choices: Array.isArray(question.choices) ? question.choices : [],
        correctIndex: question.correct_index,
      })),
    },
    latestAttempt: attemptRow
      ? {
          score: (attemptRow as QuizAttemptRow).score,
          passed: (attemptRow as QuizAttemptRow).passed,
          attemptedAt: (attemptRow as QuizAttemptRow).attempted_at,
        }
      : null,
    source: 'supabase',
  };
}

export async function submitQuizAttempt(
  userId: string,
  quizId: string,
  moduleId: string,
  score: number,
  passed: boolean,
): Promise<{ error: string | null }> {
  const supabase = getSupabase();

  const { error } = await supabase.from('quiz_attempts').insert({
    quiz_id: quizId,
    user_id: userId,
    score,
    passed,
  });

  if (error) return { error: error.message };

  if (passed) {
    await autoCompleteTask(userId, buildQuizPassEvent(moduleId));
  }

  return { error: null };
}

export function useQuiz(moduleId: string | undefined) {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  const load = useCallback(
    async (userId: string, targetModuleId: string) => {
      setLoading(true);
      setError(null);
      setResult(null);
      setAnswers({});

      try {
        const remote = await fetchQuizForModule(targetModuleId, userId);
        if (remote) {
          setData(remote);
          return;
        }
        setData(buildQuizFixture(targetModuleId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load quiz';
        setError(message);
        setData(buildQuizFixture(targetModuleId));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (authLoading || !moduleId) return;

    if (!user?.id) {
      setData(null);
      setLoading(false);
      return;
    }

    void load(user.id, moduleId);
  }, [authLoading, load, moduleId, user?.id]);

  const setAnswer = useCallback((questionId: string, choiceIndex: number) => {
    setAnswers((current) => ({ ...current, [questionId]: choiceIndex }));
  }, []);

  const submit = useCallback(async () => {
    if (!user?.id || !data?.quiz || !moduleId) return;
    if (!isQuizAnswered(data.quiz.questions, answers)) {
      setError('Answer every question before submitting.');
      return;
    }

    const score = calculateQuizScore(data.quiz.questions, answers);
    const passed = hasPassedQuiz(score, data.quiz.passScore);
    setResult({ score, passed });
    setSubmitting(true);
    setError(null);

    try {
      if (data.source === 'supabase') {
        const { error: submitError } = await submitQuizAttempt(
          user.id,
          data.quiz.id,
          moduleId,
          score,
          passed,
        );
        if (submitError) {
          setError(submitError);
          return;
        }
      }

      setData((current) =>
        current
          ? {
              ...current,
              latestAttempt: { score, passed, attemptedAt: new Date().toISOString() },
            }
          : current,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit quiz';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [answers, data, moduleId, user?.id]);

  return {
    data,
    answers,
    loading: authLoading || loading,
    submitting,
    error,
    result,
    setAnswer,
    submit,
    canSubmit: data ? isQuizAnswered(data.quiz.questions, answers) : false,
  };
}
