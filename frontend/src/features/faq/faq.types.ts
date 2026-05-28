export interface FaqCategory {
  id: string;
  name: string;
  slug: string;
}

export interface FaqArticle {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  title: string;
  body: string;
  reviewedAt: string | null;
}

export interface FaqCategoryGroup {
  category: FaqCategory;
  articles: FaqArticle[];
}

export interface FaqData {
  categories: FaqCategory[];
  articles: FaqArticle[];
  source: 'supabase' | 'fixture';
}
