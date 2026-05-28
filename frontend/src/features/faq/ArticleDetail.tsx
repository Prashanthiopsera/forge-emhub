import { formatReviewedDate } from '@/features/faq/faq.logic';
import type { FaqArticle } from '@/features/faq/faq.types';

interface ArticleDetailProps {
  article: FaqArticle;
  onBack: () => void;
}

export function ArticleDetail({ article, onBack }: ArticleDetailProps) {
  return (
    <article
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-labelledby="faq-article-title"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-4 text-sm font-medium text-brand-700 hover:text-brand-800"
      >
        ← Back to results
      </button>
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
        {article.categoryName}
      </p>
      <h2 id="faq-article-title" className="mt-1 text-2xl font-semibold text-slate-900">
        {article.title}
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Last reviewed: {formatReviewedDate(article.reviewedAt)}
      </p>
      <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
        {article.body}
      </div>
    </article>
  );
}
