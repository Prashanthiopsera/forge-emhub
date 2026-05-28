import { useCallback, useEffect, useState } from 'react';
import type { FaqAdminArticle } from '@/features/faq-admin/faqAdmin.logic';
import { FAQ_FIXTURE_ARTICLES, FAQ_FIXTURE_CATEGORIES } from '@/features/faq/faq.fixtures';
import type { FaqCategory } from '@/features/faq/faq.types';
import { getSupabase } from '@/lib/supabase';

interface FaqArticleAdminRow {
  id: string;
  category_id: string;
  title: string;
  body: string;
  reviewed_at: string | null;
  published: boolean;
  updated_at: string;
}

function mapArticle(row: FaqArticleAdminRow): FaqAdminArticle {
  return {
    id: row.id,
    categoryId: row.category_id,
    title: row.title,
    body: row.body,
    reviewedAt: row.reviewed_at,
    published: row.published,
    updatedAt: row.updated_at,
  };
}

export async function fetchFaqAdminData(): Promise<{
  categories: FaqCategory[];
  articles: FaqAdminArticle[];
} | null> {
  const supabase = getSupabase();

  const [{ data: categories, error: catError }, { data: articles, error: artError }] =
    await Promise.all([
      supabase.from('faq_categories').select('id, name, slug').order('name'),
      supabase
        .from('faq_articles')
        .select('id, category_id, title, body, reviewed_at, published, updated_at')
        .order('title'),
    ]);

  if (catError || artError || !categories || !articles) return null;

  return {
    categories: categories as FaqCategory[],
    articles: (articles as FaqArticleAdminRow[]).map(mapArticle),
  };
}

export function useFaqAdmin() {
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [articles, setArticles] = useState<FaqAdminArticle[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'fixture'>('fixture');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const remote = await fetchFaqAdminData();
      if (remote) {
        setCategories(remote.categories);
        setArticles(remote.articles);
        setSource('supabase');
        return;
      }
      setCategories(FAQ_FIXTURE_CATEGORIES);
      setArticles(
        FAQ_FIXTURE_ARTICLES.map((article) => ({
          id: article.id,
          categoryId: article.categoryId,
          title: article.title,
          body: article.body,
          reviewedAt: article.reviewedAt,
          published: true,
          updatedAt: '2026-05-01T12:00:00.000Z',
        })),
      );
      setSource('fixture');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load FAQ admin');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = articles.find((article) => article.id === selectedId) ?? null;

  const saveArticle = useCallback(
    async (draft: FaqAdminArticle) => {
      setSaving(true);
      setError(null);

      const payload = {
        category_id: draft.categoryId,
        title: draft.title.trim(),
        body: draft.body.trim(),
        published: draft.published,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        if (source === 'supabase') {
          if (draft.id.startsWith('new-')) {
            const { data, error: insertError } = await getSupabase()
              .from('faq_articles')
              .insert(payload)
              .select('id, category_id, title, body, reviewed_at, published, updated_at')
              .single();
            if (insertError || !data) throw new Error(insertError?.message ?? 'Insert failed');
            const created = mapArticle(data as FaqArticleAdminRow);
            setArticles((current) => [...current, created]);
            setSelectedId(created.id);
          } else {
            const { error: updateError } = await getSupabase()
              .from('faq_articles')
              .update(payload)
              .eq('id', draft.id);
            if (updateError) throw new Error(updateError.message);
            setArticles((current) =>
              current.map((article) =>
                article.id === draft.id
                  ? { ...draft, reviewedAt: payload.reviewed_at, updatedAt: payload.updated_at }
                  : article,
              ),
            );
          }
          return;
        }

        setArticles((current) => {
          if (draft.id.startsWith('new-')) {
            const created = { ...draft, id: `fa-local-${Date.now()}`, updatedAt: payload.updated_at };
            return [...current, created];
          }
          return current.map((article) => (article.id === draft.id ? { ...draft, ...payload } : article));
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Save failed');
      } finally {
        setSaving(false);
      }
    },
    [source],
  );

  const deleteArticle = useCallback(
    async (id: string) => {
      if (source === 'supabase' && !id.startsWith('new-')) {
        const { error: deleteError } = await getSupabase().from('faq_articles').delete().eq('id', id);
        if (deleteError) {
          setError(deleteError.message);
          return;
        }
      }
      setArticles((current) => current.filter((article) => article.id !== id));
      if (selectedId === id) setSelectedId(null);
    },
    [source, selectedId],
  );

  const createNew = useCallback(() => {
    const categoryId = categories[0]?.id ?? '';
    const draft: FaqAdminArticle = {
      id: `new-${Date.now()}`,
      categoryId,
      title: '',
      body: '',
      reviewedAt: null,
      published: false,
      updatedAt: new Date().toISOString(),
    };
    setArticles((current) => [...current, draft]);
    setSelectedId(draft.id);
  }, [categories]);

  return {
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
    reload: load,
  };
}
