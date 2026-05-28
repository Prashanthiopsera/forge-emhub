import { useMemo, useState } from 'react';
import { ArticleDetail } from '@/features/faq/ArticleDetail';
import { CategoryList } from '@/features/faq/CategoryList';
import { findArticleById, groupArticlesByCategory } from '@/features/faq/faq.logic';
import { SearchBar } from '@/features/faq/SearchBar';
import { useFaqSearch } from '@/features/faq/useFaqSearch';

export function FaqPage() {
  const { query, setQuery, data, loading, error } = useFaqSearch();
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const groups = useMemo(() => {
    if (!data) return [];
    return groupArticlesByCategory(data.categories, data.articles);
  }, [data]);

  const selectedArticle = useMemo(
    () => findArticleById(data?.articles ?? [], selectedArticleId),
    [data?.articles, selectedArticleId],
  );

  function handleSelectArticle(id: string) {
    setSelectedArticleId(id);
  }

  function handleBack() {
    setSelectedArticleId(null);
  }

  if (loading && !data) {
    return <p className="text-sm text-slate-600">Loading FAQ…</p>;
  }

  return (
    <section aria-labelledby="faq-title" className="space-y-6">
      <header>
        <h1 id="faq-title" className="text-2xl font-semibold text-slate-900">
          FAQ
        </h1>
        <p className="mt-1 text-slate-600">
          Searchable knowledge base for common onboarding questions.
        </p>
        {error ? (
          <p className="mt-2 text-sm text-amber-700" role="status">
            Showing cached demo data ({error}).
          </p>
        ) : null}
        {data?.source === 'fixture' && !error ? (
          <p className="mt-2 text-sm text-slate-500" role="status">
            Showing demo FAQ data.
          </p>
        ) : null}
      </header>

      <SearchBar
        value={query}
        onChange={(value) => {
          setQuery(value);
          setSelectedArticleId(null);
        }}
        loading={loading}
        resultCount={data?.articles.length}
      />

      {selectedArticle ? (
        <ArticleDetail article={selectedArticle} onBack={handleBack} />
      ) : (
        <CategoryList
          groups={groups}
          selectedArticleId={selectedArticleId}
          onSelectArticle={handleSelectArticle}
        />
      )}
    </section>
  );
}
