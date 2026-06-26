import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { isEligibleForCertificate } from '@/features/training/certificate.logic';
import { downloadModuleCertificate } from '@/features/training/downloadCertificate';
import {
  completionPercent,
  filterModulesByCategory,
  formatDuration,
} from '@/features/training/training.logic';
import type { CatalogModule, TrainingCategory } from '@/features/training/training.types';
import { TRAINING_CATEGORIES } from '@/features/training/training.types';
import { useTrainingProgress } from '@/features/training/useTrainingProgress';
import { VideoPlayer } from '@/features/training/VideoPlayer';

type CategoryFilter = TrainingCategory | 'all';

function completionLabel(module: CatalogModule): string {
  if (module.completed) return 'Completed';
  if (module.watchedSeconds > 0) return 'In progress';
  return 'Not started';
}

export function TrainingCatalogPage() {
  const { user } = useAuth();
  const { data, loading, error, saving, updateModuleProgress } = useTrainingProgress();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredModules = useMemo(() => {
    if (!data) return [];
    return filterModulesByCategory(data.modules, category);
  }, [category, data]);

  const selectedModule =
    filteredModules.find((module) => module.id === selectedId) ??
    filteredModules[0] ??
    null;

  if (loading) {
    return <p className="text-sm text-slate-600">Loading training catalog…</p>;
  }

  if (!data) {
    return (
      <section aria-labelledby="training-empty">
        <h1 id="training-empty" className="text-2xl font-semibold text-slate-900">
          Training
        </h1>
        <p className="mt-2 text-slate-600">Sign in to view required training videos.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="training-title" className="space-y-6">
      <header>
        <h1 id="training-title" className="text-2xl font-semibold text-slate-900">
          Training
        </h1>
        <p className="mt-1 text-slate-600">
          Watch required onboarding videos. Progress saves automatically and resumes where you left off.
        </p>
        {error ? (
          <p className="mt-2 text-sm text-amber-700" role="status">
            Showing cached demo data ({error}).
          </p>
        ) : null}
        {data.source === 'fixture' && !error ? (
          <p className="mt-2 text-sm text-slate-500" role="status">
            Showing demo training data.
          </p>
        ) : null}
        {saving ? (
          <p className="mt-2 text-sm text-slate-500" role="status">
            Saving progress…
          </p>
        ) : null}
      </header>

      <fieldset className="flex flex-wrap gap-2 border-0 p-0">
        <legend className="sr-only">Filter by category</legend>
        <button
          type="button"
          aria-pressed={category === 'all'}
          onClick={() => setCategory('all')}
          className={[
            'rounded-full px-3 py-1 text-sm font-medium',
            category === 'all'
              ? 'bg-brand-600 text-white'
              : 'border border-slate-200 bg-white text-slate-700 hover:border-brand-300',
          ].join(' ')}
        >
          All
        </button>
        {TRAINING_CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
            className={[
              'rounded-full px-3 py-1 text-sm font-medium',
              category === item
                ? 'bg-brand-600 text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-brand-300',
            ].join(' ')}
          >
            {item}
          </button>
        ))}
      </fieldset>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <ul className="space-y-3" aria-label="Training modules">
          {filteredModules.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
              No modules in this category.
            </li>
          ) : (
            filteredModules.map((module) => {
              const isSelected = selectedModule?.id === module.id;
              const percent = completionPercent(module.watchedSeconds, module.durationSeconds);

              return (
                <li key={module.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(module.id)}
                    className={[
                      'w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                      isSelected
                        ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                        : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/50',
                    ].join(' ')}
                    aria-pressed={isSelected}
                  >
                    <span className="font-medium text-slate-900">{module.title}</span>
                    <span className="mt-1 block text-xs text-slate-500">{module.category}</span>
                    {module.description ? (
                      <span className="mt-1 block text-xs text-slate-600 line-clamp-2">
                        {module.description}
                      </span>
                    ) : null}
                    <span className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-medium text-slate-600">
                        {formatDuration(module.durationSeconds)}
                      </span>
                      <span
                        className={[
                          'rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide',
                          module.completed
                            ? 'bg-emerald-100 text-emerald-800'
                            : module.watchedSeconds > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600',
                        ].join(' ')}
                      >
                        {completionLabel(module)}
                      </span>
                      {module.required ? (
                        <span className="text-brand-700">Required</span>
                      ) : (
                        <span className="text-slate-500">Optional</span>
                      )}
                    </span>
                    <div
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${module.title} watch progress`}
                    >
                      <div
                        className="h-full rounded-full bg-brand-600"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          {selectedModule ? (
            <>
              <h2 className="text-lg font-semibold text-slate-900">{selectedModule.title}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {selectedModule.description ?? 'No description available.'}
              </p>
              <VideoPlayer
                module={selectedModule}
                onProgress={(watchedSeconds) =>
                  void updateModuleProgress(selectedModule.id, watchedSeconds)
                }
              />
              <p className="mt-3 text-xs text-slate-500">
                Videos are marked complete after watching at least 90% of the runtime.
              </p>
              {selectedModule.id === 'e1000000-0000-4000-8000-000000000002' ? (
                <p className="mt-3">
                  <Link
                    to={`/training/${selectedModule.id}/quiz`}
                    className="text-sm font-medium text-brand-700 hover:underline"
                  >
                    Take the security quiz →
                  </Link>
                </p>
              ) : null}
              {isEligibleForCertificate(
                selectedModule,
                selectedModule.id === 'e1000000-0000-4000-8000-000000000002' ? false : null,
              ) ? (
                <p className="mt-3">
                  <button
                    type="button"
                    className="rounded-lg border border-brand-600 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
                    onClick={() =>
                      downloadModuleCertificate(
                        selectedModule,
                        user?.email?.split('@')[0] ?? 'Employee',
                        user?.id ?? 'demo-user',
                      )
                    }
                  >
                    Download completion certificate (PDF)
                  </button>
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-slate-600">Select a module to start watching.</p>
          )}
        </div>
      </div>
    </section>
  );
}
