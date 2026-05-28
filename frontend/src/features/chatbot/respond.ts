import type { FaqArticle } from '@/features/faq/faq.types';

export const LLM_STUB_DISCLAIMER =
  'This is an automated assistant stub, not a live LLM. Answers may be incomplete — verify with HR or your manager.';

export const CHAT_RATE_LIMIT_MAX = 20;
export const CHAT_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export const FAQ_MATCH_MIN_SCORE = 2;

export type ChatResponseSource = 'faq' | 'llm_stub' | 'rate_limited';

export interface ChatArticleMatch {
  id: string;
  title: string;
  body: string;
}

export interface ChatRespondResult {
  text: string;
  source: ChatResponseSource;
  articleId?: string;
  confidenceScore?: number;
  disclaimer?: string;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

/** Scores FAQ articles by keyword overlap with the user message (WO-021). */
export function scoreFaqArticles(
  message: string,
  articles: readonly ChatArticleMatch[],
): { article: ChatArticleMatch; score: number } | null {
  const tokens = tokenize(message);
  if (tokens.length === 0) return null;

  let best: { article: ChatArticleMatch; score: number } | null = null;

  for (const article of articles) {
    const haystack = tokenize(`${article.title} ${article.body}`);
    const hayset = new Set(haystack);
    let score = 0;
    for (const token of tokens) {
      if (hayset.has(token)) score += 1;
    }
    if (titleMatchesQuery(article.title, message)) score += 2;
    if (!best || score > best.score) {
      best = { article, score };
    }
  }

  return best;
}

function titleMatchesQuery(title: string, message: string): boolean {
  const normalizedMessage = message.trim().toLowerCase();
  const normalizedTitle = title.trim().toLowerCase();
  return (
    normalizedMessage.length > 0 &&
    (normalizedTitle.includes(normalizedMessage) || normalizedMessage.includes(normalizedTitle))
  );
}

export function matchFaqArticle(
  message: string,
  articles: readonly ChatArticleMatch[],
): ChatArticleMatch | null {
  const best = scoreFaqArticles(message, articles);
  if (!best || best.score < FAQ_MATCH_MIN_SCORE) return null;
  return best.article;
}

export function buildLlmStubResponse(message: string): ChatRespondResult {
  const trimmed = message.trim();
  const preview = trimmed.length > 80 ? `${trimmed.slice(0, 80)}…` : trimmed;

  return {
    text: `I could not find a matching FAQ article for "${preview || 'your question'}". ${LLM_STUB_DISCLAIMER}`,
    source: 'llm_stub',
    confidenceScore: 0.25,
    disclaimer: LLM_STUB_DISCLAIMER,
  };
}

export function buildFaqResponse(article: ChatArticleMatch, score: number): ChatRespondResult {
  return {
    text: article.body,
    source: 'faq',
    articleId: article.id,
    confidenceScore: Math.min(0.99, 0.5 + score * 0.08),
  };
}

export function buildRateLimitedResponse(): ChatRespondResult {
  return {
    text: 'You have reached the chat limit of 20 messages per hour. Please try again later or escalate to HR.',
    source: 'rate_limited',
    confidenceScore: 1,
  };
}

/** Rule-based responder: FAQ match first, then LLM stub with disclaimer (WO-021). */
export function buildChatResponse(
  message: string,
  articles: readonly ChatArticleMatch[],
): ChatRespondResult {
  const best = scoreFaqArticles(message, articles);
  if (best && best.score >= FAQ_MATCH_MIN_SCORE) {
    return buildFaqResponse(best.article, best.score);
  }
  return buildLlmStubResponse(message);
}

export function toChatArticleMatches(articles: FaqArticle[]): ChatArticleMatch[] {
  return articles.map((article) => ({
    id: article.id,
    title: article.title,
    body: article.body,
  }));
}

export function messageMetadataFromResult(result: ChatRespondResult): Record<string, string> {
  const metadata: Record<string, string> = { source: result.source };
  if (result.articleId) metadata.article_id = result.articleId;
  if (result.disclaimer) metadata.disclaimer = result.disclaimer;
  return metadata;
}
