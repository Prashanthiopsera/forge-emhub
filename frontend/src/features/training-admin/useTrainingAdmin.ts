import { useCallback, useEffect, useState } from 'react';
import { TRAINING_MODULE_FIXTURES } from '@/features/training/training.fixtures';
import type { TrainingModule } from '@/features/training/training.types';
import {
  emptyModuleDraft,
  emptyQuizQuestionDraft,
  parseVideoEmbedUrl,
  reorderModules,
  type QuizQuestionDraft,
  type TrainingModuleDraft,
  validateModuleDraft,
  validateQuizQuestionDraft,
} from '@/features/training-admin/trainingAdmin.logic';
import { getSupabase } from '@/lib/supabase';

export interface AdminTrainingModule extends TrainingModule {
  displayOrder: number;
  quizId: string | null;
  passScore: number;
}

interface ModuleRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  video_provider: string | null;
  video_external_id: string | null;
  duration_seconds: number | null;
  required: boolean;
  display_order: number;
}

interface QuizRow {
  id: string;
  module_id: string;
  pass_score: number;
}

interface QuestionRow {
  id: string;
  quiz_id: string;
  prompt: string;
  sort_order: number;
  choices: string[];
  correct_index: number;
}

function mapModule(row: ModuleRow, quiz: QuizRow | null): AdminTrainingModule {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    videoProvider: row.video_provider,
    videoExternalId: row.video_external_id,
    durationSeconds: row.duration_seconds ?? 0,
    required: row.required,
    displayOrder: row.display_order ?? 0,
    quizId: quiz?.id ?? null,
    passScore: quiz?.pass_score ?? 80,
  };
}

function moduleToDraft(module: AdminTrainingModule): TrainingModuleDraft {
  const provider = module.videoProvider ?? 'vimeo';
  const id = module.videoExternalId ?? '';
  const videoUrl =
    provider === 'wistia'
      ? `https://fast.wistia.net/embed/iframe/${id}`
      : `https://player.vimeo.com/video/${id}`;

  return {
    id: module.id,
    title: module.title,
    description: module.description ?? '',
    category: module.category,
    videoUrl,
    durationSeconds: module.durationSeconds,
    required: module.required,
    displayOrder: module.displayOrder,
  };
}

export function useTrainingAdmin() {
  const [modules, setModules] = useState<AdminTrainingModule[]>([]);
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [moduleDraft, setModuleDraft] = useState<TrainingModuleDraft>(emptyModuleDraft());
  const [passScore, setPassScore] = useState(80);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'fixture'>('fixture');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabase();
      const { data: moduleRows, error: modError } = await supabase
        .from('training_modules')
        .select(
          'id, title, description, category, video_provider, video_external_id, duration_seconds, required, display_order',
        )
        .order('display_order');

      if (modError || !moduleRows) throw modError;

      const { data: quizRows } = await supabase
        .from('quizzes')
        .select('id, module_id, pass_score');

      const quizByModule = new Map(
        ((quizRows ?? []) as QuizRow[]).map((quiz) => [quiz.module_id, quiz]),
      );

      const mapped = (moduleRows as ModuleRow[]).map((row) =>
        mapModule(row, quizByModule.get(row.id) ?? null),
      );

      setModules(mapped);
      setSource('supabase');
      setSelectedId((current) => current ?? mapped[0]?.id ?? null);
    } catch {
      const fixture = TRAINING_MODULE_FIXTURES.map((module, index) => ({
        ...module,
        displayOrder: index + 1,
        quizId: module.id === 'm1000000-0000-4000-8000-000000000002' ? 'q1000000-0000-4000-8000-000000000001' : null,
        passScore: 80,
      }));
      setModules(fixture);
      setSource('fixture');
      setSelectedId((current) => current ?? fixture[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = modules.find((module) => module.id === selectedId) ?? null;

  useEffect(() => {
    if (selected) {
      setModuleDraft(moduleToDraft(selected));
      setPassScore(selected.passScore);
      void loadQuestions(selected.quizId);
    } else {
      setModuleDraft(emptyModuleDraft(modules.length + 1));
      setQuestions([]);
    }
  }, [selected, modules.length]);

  const loadQuestions = async (quizId: string | null) => {
    if (!quizId) {
      setQuestions([]);
      return;
    }

    try {
      const supabase = getSupabase();
      const { data, error: qError } = await supabase
        .from('quiz_questions')
        .select('id, quiz_id, prompt, sort_order, choices, correct_index')
        .eq('quiz_id', quizId)
        .order('sort_order');

      if (qError || !data) throw qError;

      setQuestions(
        (data as QuestionRow[]).map((row) => ({
          id: row.id,
          quizId: row.quiz_id,
          prompt: row.prompt,
          choices: row.choices,
          correctIndex: row.correct_index,
          sortOrder: row.sort_order,
        })),
      );
    } catch {
      setQuestions([
        {
          id: 'qq100000-0000-4000-8000-00000000001',
          quizId,
          prompt: 'What should you enable on all company devices?',
          choices: ['MFA', 'Guest Wi-Fi sharing', 'Public file sync'],
          correctIndex: 0,
          sortOrder: 1,
        },
      ]);
    }
  };

  const saveModule = useCallback(async () => {
    const validationError = validateModuleDraft(moduleDraft);
    if (validationError) {
      setError(validationError);
      return;
    }

    const parsed = parseVideoEmbedUrl(moduleDraft.videoUrl);
    if (!parsed) {
      setError('Invalid video URL');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (source === 'fixture') {
        const id = moduleDraft.id ?? crypto.randomUUID();
        const next: AdminTrainingModule = {
          id,
          title: moduleDraft.title,
          description: moduleDraft.description,
          category: moduleDraft.category,
          videoProvider: parsed.provider,
          videoExternalId: parsed.externalId,
          durationSeconds: moduleDraft.durationSeconds,
          required: moduleDraft.required,
          displayOrder: moduleDraft.displayOrder,
          quizId: selected?.quizId ?? null,
          passScore,
        };
        setModules((current) => {
          const existing = current.find((m) => m.id === id);
          if (existing) {
            return current.map((m) => (m.id === id ? next : m));
          }
          return [...current, next];
        });
        setSelectedId(id);
        return;
      }

      const supabase = getSupabase();
      const payload = {
        title: moduleDraft.title.trim(),
        description: moduleDraft.description.trim() || null,
        category: moduleDraft.category,
        video_provider: parsed.provider,
        video_external_id: parsed.externalId,
        duration_seconds: moduleDraft.durationSeconds,
        required: moduleDraft.required,
        display_order: moduleDraft.displayOrder,
      };

      if (moduleDraft.id) {
        await supabase.from('training_modules').update(payload).eq('id', moduleDraft.id);
      } else {
        const { data } = await supabase.from('training_modules').insert(payload).select('id').single();
        if (data) moduleDraft.id = (data as { id: string }).id;
      }

      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save module');
    } finally {
      setSaving(false);
    }
  }, [load, moduleDraft, passScore, selected?.quizId, source]);

  const deleteModule = useCallback(async () => {
    if (!moduleDraft.id) return;
    setSaving(true);
    try {
      if (source === 'fixture') {
        setModules((current) => current.filter((m) => m.id !== moduleDraft.id));
        setSelectedId(null);
        return;
      }
      await getSupabase().from('training_modules').delete().eq('id', moduleDraft.id);
      await load();
      setSelectedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete module');
    } finally {
      setSaving(false);
    }
  }, [load, moduleDraft.id, source]);

  const moveModule = useCallback(
    (fromIndex: number, toIndex: number) => {
      setModules((current) => reorderModules(current, fromIndex, toIndex));
    },
    [],
  );

  const saveQuestion = useCallback(
    async (draft: QuizQuestionDraft) => {
      const validationError = validateQuizQuestionDraft(draft);
      if (validationError) {
        setError(validationError);
        return;
      }

      setQuestions((current) => {
        const id = draft.id ?? crypto.randomUUID();
        const next = { ...draft, id };
        const existingIndex = current.findIndex((q) => q.id === id);
        if (existingIndex >= 0) {
          const copy = [...current];
          copy[existingIndex] = next;
          return copy;
        }
        return [...current, next];
      });
    },
    [],
  );

  const deleteQuestion = useCallback((questionId: string) => {
    setQuestions((current) => current.filter((q) => q.id !== questionId));
  }, []);

  const createNewModule = useCallback(() => {
    setSelectedId(null);
    setModuleDraft(emptyModuleDraft(modules.length + 1));
    setQuestions([]);
  }, [modules.length]);

  return {
    modules,
    selectedId,
    setSelectedId,
    moduleDraft,
    setModuleDraft,
    questions,
    setQuestions,
    passScore,
    setPassScore,
    loading,
    saving,
    error,
    source,
    saveModule,
    deleteModule,
    moveModule,
    saveQuestion,
    deleteQuestion,
    createNewModule,
    reload: load,
  };
}
