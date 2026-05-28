import type { FaqCategoryGroup } from '@/features/faq/faq.types';

interface CategoryListProps {
  groups: FaqCategoryGroup[];
  selectedArticleId: string | null;
  onSelectArticle: (id: string) => void;
}

export function CategoryList({ groups, selectedArticleId, onSelectArticle }: CategoryListProps) {
  if (groups.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
        No articles match your search. Try different keywords or clear the search box.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(({ category, articles }) => (
        <section key={category.id} aria-labelledby={`faq-cat-${category.slug}`}>
          <h2
            id={`faq-cat-${category.slug}`}
            className="text-lg font-semibold text-slate-900"
          >
            {category.name}
          </h2>
          <ul className="mt-3 space-y-2">
            {articles.map((article) => {
              const isSelected = article.id === selectedArticleId;
              return (
                <li key={article.id}>
                  <button
                    type="button"
                    onClick={() => onSelectArticle(article.id)}
                    className={[
                      'w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                      isSelected
                        ? 'border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-200'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-brand-300 hover:bg-brand-50',
                    ].join(' ')}
                    aria-current={isSelected ? 'true' : undefined}
                  >
                    <span className="font-medium">{article.title}</span>
                    <span className="mt-1 block line-clamp-2 text-xs text-slate-500">
                      {article.body}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
