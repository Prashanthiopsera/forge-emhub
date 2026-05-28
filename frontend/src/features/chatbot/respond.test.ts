import { describe, expect, it } from 'vitest';
import { FAQ_FIXTURE_ARTICLES } from '@/features/faq/faq.fixtures';
import {
  buildChatResponse,
  buildLlmStubResponse,
  buildRateLimitedResponse,
  LLM_STUB_DISCLAIMER,
  matchFaqArticle,
  messageMetadataFromResult,
  toChatArticleMatches,
} from '@/features/chatbot/respond';

describe('chatbot respond (WO-021)', () => {
  const articles = toChatArticleMatches(FAQ_FIXTURE_ARTICLES);

  it('matches FAQ articles by keyword overlap', () => {
    const match = matchFaqArticle('How do I request laptop provisioning?', articles);
    expect(match?.title).toMatch(/laptop/i);
  });

  it('returns FAQ body when matched', () => {
    const result = buildChatResponse('laptop provisioning request', articles);
    expect(result.source).toBe('faq');
    expect(result.articleId).toBeTruthy();
    expect(result.text).toMatch(/IT portal/i);
  });

  it('falls back to LLM stub with disclaimer when no FAQ match', () => {
    const result = buildLlmStubResponse('quantum payroll tensor');
    expect(result.source).toBe('llm_stub');
    expect(result.disclaimer).toBe(LLM_STUB_DISCLAIMER);
    expect(result.text).toContain(LLM_STUB_DISCLAIMER);
  });

  it('builds rate limited response', () => {
    const result = buildRateLimitedResponse();
    expect(result.source).toBe('rate_limited');
    expect(result.text).toMatch(/20 messages per hour/i);
  });

  it('stores source in message metadata', () => {
    const result = buildChatResponse('benefits enrollment start', articles);
    const metadata = messageMetadataFromResult(result);
    expect(metadata.source).toBe('faq');
    expect(metadata.article_id).toBeTruthy();
  });
});
