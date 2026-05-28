import type { FaqArticle, FaqCategory, FaqCategoryGroup } from '@/features/faq/faq.types';

export function groupArticlesByCategory(
  categories: FaqCategory[],
  articles: FaqArticle[],
): FaqCategoryGroup[] {
  const byCategory = new Map<string, FaqArticle[]>();

  for (const article of articles) {
    const list = byCategory.get(article.categoryId) ?? [];
    list.push(article);
    byCategory.set(article.categoryId, list);
  }

  return categories
    .map((category) => ({
      category,
      articles: (byCategory.get(category.id) ?? []).sort((a, b) =>
        a.title.localeCompare(b.title),
      ),
    }))
    .filter((group) => group.articles.length > 0);
}

export function filterArticlesByQuery(articles: FaqArticle[], query: string): FaqArticle[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return articles;

  return articles.filter(
    (article) =>
      article.title.toLowerCase().includes(normalized) ||
      article.body.toLowerCase().includes(normalized) ||
      article.categoryName.toLowerCase().includes(normalized),
  );
}

export function findArticleById(articles: FaqArticle[], id: string | null): FaqArticle | null {
  if (!id) return null;
  return articles.find((article) => article.id === id) ?? null;
}

export function formatReviewedDate(iso: string | null): string {
  if (!iso) return 'Not yet reviewed';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
