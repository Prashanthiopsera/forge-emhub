import { useEffect, useState } from 'react';
import {
  isArticleStale,
  staleWarningMessage,
  type FaqAdminArticle,
} from '@/features/faq-admin/faqAdmin.logic';
import { useFaqAdmin } from '@/features/faq-admin/useFaqAdmin';

export function FaqAdminPage() {
  const {
    categories,
    articles,
    selected,
    selectedId,
    setSelectedId,
    loading,
    saving,
    error,
    source,
    saveArticle,
    deleteArticle,
    createNew,
  } = useFaqAdmin();

  const [draft, setDraft] = useState<FaqAdminArticle | null>(null);

  useEffect(() => {
    setDraft(selected ? { ...selected } : null);
  }, [selected]);

  if (loading) {
    return <p className="text-sm text-slate-600">Loading FAQ editor…</p>;
  }

  const staleWarning = draft ? staleWarningMessage(draft.reviewedAt) : null;

  return (
    <section aria-labelledby="faq-admin-title" className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 id="faq-admin-title" className="text-2xl font-semibold text-slate-900">
            FAQ Admin
          </h1>
          <p className="mt-1 text-slate-600">
            Create and edit articles (markdown in textarea). Stale content is flagged after 90
            days.
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
          onClick={createNew}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
        >
          New article
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <aside className="rounded-xl border border-slate-200 bg-white">
          <h2 className="border-b border-slate-100 px-4 py-3 text-sm font-semibold">Articles</h2>
          <ul>
            {articles.map((article) => (
              <li key={article.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(article.id)}
                  className={`flex w-full items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 text-left text-sm hover:bg-slate-50 ${
                    selectedId === article.id ? 'bg-brand-50' : ''
                  }`}
                >
                  <span className="font-medium text-slate-900">{article.title || '(untitled)'}</span>
                  {isArticleStale(article.reviewedAt) ? (
                    <span className="shrink-0 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
                      Stale
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {draft ? (
          <form
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
            onSubmit={(event) => {
              event.preventDefault();
              void saveArticle(draft);
            }}
          >
            {staleWarning ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
                {staleWarning}
              </p>
            ) : null}

            <div>
              <label htmlFor="faq-title" className="block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                id="faq-title"
                type="text"
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="faq-category" className="block text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                id="faq-category"
                value={draft.categoryId}
                onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="faq-body" className="block text-sm font-medium text-slate-700">
                Body (markdown)
              </label>
              <textarea
                id="faq-body"
                value={draft.body}
                onChange={(event) => setDraft({ ...draft, body: event.target.value })}
                rows={12}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
                required
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(event) => setDraft({ ...draft, published: event.target.checked })}
              />
              Published
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => void deleteArticle(draft.id)}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700"
              >
                Delete
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-600">Select an article to edit.</p>
        )}
      </div>
    </section>
  );
}
