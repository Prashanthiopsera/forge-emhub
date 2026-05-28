import { describe, expect, it } from 'vitest';
import { FAQ_FIXTURE_ARTICLES, FAQ_FIXTURE_CATEGORIES } from '@/features/faq/faq.fixtures';
import {
  filterArticlesByQuery,
  findArticleById,
  groupArticlesByCategory,
} from '@/features/faq/faq.logic';

describe('faq.logic (WO-024)', () => {
  it('groups articles under their categories', () => {
    const groups = groupArticlesByCategory(FAQ_FIXTURE_CATEGORIES, FAQ_FIXTURE_ARTICLES);
    expect(groups).toHaveLength(5);
    expect(groups.find((g) => g.category.slug === 'benefits')?.articles).toHaveLength(5);
  });

  it('filters articles by query for fixture fallback', () => {
    const filtered = filterArticlesByQuery(FAQ_FIXTURE_ARTICLES, 'laptop');
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.title).toMatch(/laptop/i);
  });

  it('finds article by id', () => {
    const article = findArticleById(FAQ_FIXTURE_ARTICLES, FAQ_FIXTURE_ARTICLES[0]?.id ?? '');
    expect(article?.title).toMatch(/benefits enrollment/i);
  });
});
