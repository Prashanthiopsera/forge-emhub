export const FAQ_STALE_DAYS = 90;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface FaqAdminArticle {
  id: string;
  categoryId: string;
  title: string;
  body: string;
  reviewedAt: string | null;
  published: boolean;
  updatedAt: string;
}

export function isArticleStale(reviewedAt: string | null, now = new Date()): boolean {
  if (!reviewedAt) return true;
  const reviewed = new Date(reviewedAt);
  if (Number.isNaN(reviewed.getTime())) return true;
  const ageDays = (now.getTime() - reviewed.getTime()) / MS_PER_DAY;
  return ageDays > FAQ_STALE_DAYS;
}

export function staleWarningMessage(reviewedAt: string | null): string | null {
  if (!isArticleStale(reviewedAt)) return null;
  if (!reviewedAt) {
    return `This article has never been reviewed. Content older than ${FAQ_STALE_DAYS} days should be verified.`;
  }
  return `Last reviewed over ${FAQ_STALE_DAYS} days ago — please verify accuracy before publishing.`;
}

export function emptyArticleDraft(categoryId: string): Omit<FaqAdminArticle, 'id' | 'updatedAt'> {
  return {
    categoryId,
    title: '',
    body: '',
    reviewedAt: null,
    published: false,
  };
}
