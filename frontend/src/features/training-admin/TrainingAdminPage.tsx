import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TRAINING_CATEGORIES } from '@/features/training/training.types';
import {
  emptyQuizQuestionDraft,
  validateModuleDraft,
  type QuizQuestionDraft,
} from '@/features/training-admin/trainingAdmin.logic';
import { useTrainingAdmin } from '@/features/training-admin/useTrainingAdmin';

export function TrainingAdminPage() {
  const {
    modules,
    selectedId,
    setSelectedId,
    moduleDraft,
    setModuleDraft,
    questions,
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
  } = useTrainingAdmin();

  const [questionDraft, setQuestionDraft] = useState<QuizQuestionDraft>(emptyQuizQuestionDraft());

  if (loading) {
    return <p className="text-sm text-slate-600">Loading training admin…</p>;
  }

  const moduleError = validateModuleDraft(moduleDraft);

  return (
    <section aria-labelledby="training-admin-title" className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            <Link to="/admin" className="text-brand-600 hover:underline">
              Admin
            </Link>
          </p>
          <h1 id="training-admin-title" className="text-2xl font-semibold text-slate-900">
            Training Content
          </h1>
          <p className="mt-1 text-slate-600">
            Manage modules, Vimeo/Wistia embed URLs, and quiz questions.
          </p>
          {source === 'fixture' ? (
            <p className="mt-2 text-sm text-slate-500">Demo mode — changes stay in memory.</p>
          ) : null}
          {error ? (
            <p className="mt-2 text-sm text-amber-700" role="status">
              {error}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={createNewModule}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
        >
          New module
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <aside className="rounded-xl border border-slate-200 bg-white">
          <h2 className="border-b border-slate-100 px-4 py-3 text-sm font-semibold">Modules</h2>
          <ul>
            {modules.map((module, index) => (
              <li key={module.id} className="flex items-center gap-2 border-b border-slate-100 px-2 py-2">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    className="text-xs text-slate-500 disabled:opacity-30"
                    onClick={() => moveModule(index, index - 1)}
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === modules.length - 1}
                    className="text-xs text-slate-500 disabled:opacity-30"
                    onClick={() => moveModule(index, index + 1)}
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(module.id)}
                  className={`flex-1 rounded px-2 py-2 text-left text-sm hover:bg-slate-50 ${
                    selectedId === module.id ? 'bg-brand-50 font-medium' : ''
                  }`}
                >
                  {module.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="space-y-6">
          <form
            className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void saveModule();
            }}
          >
            <h2 className="text-lg font-semibold text-slate-900">Module details</h2>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Title</span>
              <input
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={moduleDraft.title}
                onChange={(e) => setModuleDraft({ ...moduleDraft, title: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Description</span>
              <textarea
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                rows={3}
                value={moduleDraft.description}
                onChange={(e) => setModuleDraft({ ...moduleDraft, description: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Category</span>
              <select
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={moduleDraft.category}
                onChange={(e) => setModuleDraft({ ...moduleDraft, category: e.target.value })}
              >
                {TRAINING_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Video embed URL (Vimeo or Wistia)</span>
              <input
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={moduleDraft.videoUrl}
                onChange={(e) => setModuleDraft({ ...moduleDraft, videoUrl: e.target.value })}
                placeholder="https://player.vimeo.com/video/..."
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Duration (seconds)</span>
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  value={moduleDraft.durationSeconds}
                  onChange={(e) =>
                    setModuleDraft({
                      ...moduleDraft,
                      durationSeconds: Number(e.target.value) || 0,
                    })
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Quiz pass score (%)</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  value={passScore}
                  onChange={(e) => setPassScore(Number(e.target.value) || 80)}
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={moduleDraft.required}
                onChange={(e) => setModuleDraft({ ...moduleDraft, required: e.target.checked })}
              />
              Required module
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving || Boolean(moduleError)}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save module'}
              </button>
              {moduleDraft.id ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void deleteModule()}
                  className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700"
                >
                  Delete
                </button>
              ) : null}
            </div>
          </form>

          <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Quiz questions</h2>
            <ul className="space-y-3">
              {questions.map((question) => (
                <li key={question.id} className="rounded border border-slate-100 p-3 text-sm">
                  <p className="font-medium text-slate-900">{question.prompt}</p>
                  <ol className="mt-2 list-decimal pl-5 text-slate-600">
                    {question.choices.map((choice, index) => (
                      <li key={index} className={index === question.correctIndex ? 'font-semibold' : ''}>
                        {choice}
                        {index === question.correctIndex ? ' (correct)' : ''}
                      </li>
                    ))}
                  </ol>
                  <button
                    type="button"
                    className="mt-2 text-xs text-red-600"
                    onClick={() => question.id && deleteQuestion(question.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Question</span>
                <input
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  value={questionDraft.prompt}
                  onChange={(e) => setQuestionDraft({ ...questionDraft, prompt: e.target.value })}
                />
              </label>
              {questionDraft.choices.map((choice, index) => (
                <label key={index} className="block text-sm">
                  <span className="font-medium text-slate-700">Option {index + 1}</span>
                  <input
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                    value={choice}
                    onChange={(e) => {
                      const next = [...questionDraft.choices];
                      next[index] = e.target.value;
                      setQuestionDraft({ ...questionDraft, choices: next });
                    }}
                  />
                </label>
              ))}
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Correct option</span>
                <select
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  value={questionDraft.correctIndex}
                  onChange={(e) =>
                    setQuestionDraft({
                      ...questionDraft,
                      correctIndex: Number(e.target.value),
                    })
                  }
                >
                  {questionDraft.choices.map((choice, index) => (
                    <option key={index} value={index}>
                      {choice || `Option ${index + 1}`}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
                onClick={() => {
                  void saveQuestion(questionDraft);
                  setQuestionDraft(emptyQuizQuestionDraft(questions.length + 1));
                }}
              >
                Add question
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
