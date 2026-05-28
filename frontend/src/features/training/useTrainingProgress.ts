import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { buildTrainingFixture } from '@/features/training/training.fixtures';
import { isVideoCompleted, mergeModuleProgress } from '@/features/training/training.logic';
import type {
  CatalogModule,
  TrainingCatalogData,
  TrainingModule,
  VideoProgress,
} from '@/features/training/training.types';
import { getSupabase } from '@/lib/supabase';

interface TrainingModuleRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  video_provider: string | null;
  video_external_id: string | null;
  duration_seconds: number | null;
  required: boolean;
}

interface VideoProgressRow {
  module_id: string;
  watched_seconds: number;
  completed: boolean;
}

function mapModuleRow(row: TrainingModuleRow): TrainingModule {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    videoProvider: row.video_provider,
    videoExternalId: row.video_external_id,
    durationSeconds: row.duration_seconds ?? 0,
    required: row.required,
  };
}

function mapProgressRows(rows: VideoProgressRow[]): VideoProgress[] {
  return rows.map((row) => ({
    moduleId: row.module_id,
    watchedSeconds: row.watched_seconds,
    completed: row.completed,
  }));
}

export async function fetchTrainingFromSupabase(userId: string): Promise<TrainingCatalogData | null> {
  const supabase = getSupabase();

  const { data: moduleRows, error: moduleError } = await supabase
    .from('training_modules')
    .select(
      'id, title, description, category, video_provider, video_external_id, duration_seconds, required',
    )
    .order('title');

  if (moduleError || !moduleRows?.length) return null;

  const { data: progressRows, error: progressError } = await supabase
    .from('video_progress')
    .select('module_id, watched_seconds, completed')
    .eq('user_id', userId);

  if (progressError) return null;

  const modules = mergeModuleProgress(
    (moduleRows as TrainingModuleRow[]).map(mapModuleRow),
    mapProgressRows((progressRows ?? []) as VideoProgressRow[]),
  );

  return { modules, source: 'supabase' };
}

export async function upsertVideoProgress(
  userId: string,
  module: CatalogModule,
  watchedSeconds: number,
): Promise<void> {
  const completed = isVideoCompleted(watchedSeconds, module.durationSeconds);
  const supabase = getSupabase();

  const { error } = await supabase.from('video_progress').upsert(
    {
      module_id: module.id,
      user_id: userId,
      watched_seconds: watchedSeconds,
      completed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'module_id,user_id' },
  );

  if (error) throw error;
}

export function useTrainingProgress() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<TrainingCatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const remote = await fetchTrainingFromSupabase(userId);
      if (remote) {
        setData(remote);
        return;
      }
      setData(buildTrainingFixture(userId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load training catalog';
      setError(message);
      setData(buildTrainingFixture(userId));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.id) {
      setData(null);
      setLoading(false);
      return;
    }

    void load(user.id);
  }, [authLoading, user?.id, load]);

  const updateModuleProgress = useCallback(
    async (moduleId: string, watchedSeconds: number) => {
      if (!user?.id || !data) return;

      const module = data.modules.find((item) => item.id === moduleId);
      if (!module) return;

      const completed = isVideoCompleted(watchedSeconds, module.durationSeconds);
      if (watchedSeconds <= module.watchedSeconds && completed === module.completed) return;

      setData((current) => {
        if (!current) return current;
        return {
          ...current,
          modules: current.modules.map((item) =>
            item.id === moduleId ? { ...item, watchedSeconds, completed } : item,
          ),
        };
      });

      if (data.source !== 'supabase') return;

      setSaving(true);
      try {
        await upsertVideoProgress(user.id, { ...module, watchedSeconds, completed }, watchedSeconds);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save progress';
        setError(message);
      } finally {
        setSaving(false);
      }
    },
    [data, user?.id],
  );

  return {
    data,
    loading: authLoading || loading,
    error,
    saving,
    updateModuleProgress,
    reload: user?.id ? () => load(user.id) : undefined,
  };
}
