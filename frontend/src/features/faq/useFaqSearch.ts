import { useCallback, useEffect, useState } from 'react';
import { buildFaqFixture } from '@/features/faq/faq.fixtures';
import { filterArticlesByQuery } from '@/features/faq/faq.logic';
import type { FaqArticle, FaqCategory, FaqData } from '@/features/faq/faq.types';
import { getSupabase } from '@/lib/supabase';

interface FaqCategoryRow {
  id: string;
  name: string;
  slug: string;
}

interface FaqArticleRow {
  id: string;
  category_id: string;
  title: string;
  body: string;
  reviewed_at: string | null;
  faq_categories: FaqCategoryRow | FaqCategoryRow[] | null;
}

function mapCategory(row: FaqCategoryRow): FaqCategory {
  return { id: row.id, name: row.name, slug: row.slug };
}

function mapArticle(row: FaqArticleRow): FaqArticle | null {
  const category = Array.isArray(row.faq_categories) ? row.faq_categories[0] : row.faq_categories;
  if (!category) return null;

  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: category.name,
    categorySlug: category.slug,
    title: row.title,
    body: row.body,
    reviewedAt: row.reviewed_at,
  };
}

const ARTICLE_SELECT =
  'id, category_id, title, body, reviewed_at, faq_categories(id, name, slug)';

export async function fetchFaqFromSupabase(query: string): Promise<FaqData | null> {
  const supabase = getSupabase();
  const trimmed = query.trim();

  const categoriesQuery = supabase
    .from('faq_categories')
    .select('id, name, slug')
    .eq('active', true)
    .order('name');

  let articlesQuery = supabase
    .from('faq_articles')
    .select(ARTICLE_SELECT)
    .eq('published', true)
    .order('title');

  if (trimmed) {
    articlesQuery = articlesQuery.textSearch('search_vector', trimmed, {
      type: 'websearch',
      config: 'english',
    });
  }

  const [{ data: categoryRows, error: categoryError }, { data: articleRows, error: articleError }] =
    await Promise.all([categoriesQuery, articlesQuery]);

  if (categoryError || articleError || !categoryRows || !articleRows) return null;

  const categories = (categoryRows as FaqCategoryRow[]).map(mapCategory);
  const articles = (articleRows as FaqArticleRow[])
    .map(mapArticle)
    .filter((article): article is FaqArticle => article !== null);

  return { categories, articles, source: 'supabase' };
}

export function useFaqSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [data, setData] = useState<FaqData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const load = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      const remote = await fetchFaqFromSupabase(searchQuery);
      if (remote) {
        setData(remote);
        return;
      }

      const fixture = buildFaqFixture();
      const articles = searchQuery
        ? filterArticlesByQuery(fixture.articles, searchQuery)
        : fixture.articles;
      setData({ ...fixture, articles });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load FAQ';
      setError(message);
      const fixture = buildFaqFixture();
      const articles = searchQuery
        ? filterArticlesByQuery(fixture.articles, searchQuery)
        : fixture.articles;
      setData({ ...fixture, articles });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(debouncedQuery);
  }, [debouncedQuery, load]);

  return { query, setQuery, data, loading, error, debouncedQuery };
}
