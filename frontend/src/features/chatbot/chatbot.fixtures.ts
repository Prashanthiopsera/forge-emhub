import type { ChatFixtureData, ChatMessage } from '@/features/chatbot/chatbot.types';

export const CHAT_SESSION_FIXTURE_ID = 'd2000000-0000-4000-8000-000000000001';

const fixtureMessages: ChatMessage[] = [
  {
    id: 'd3000000-0000-4000-8000-000000000001',
    sessionId: CHAT_SESSION_FIXTURE_ID,
    senderType: 'user',
    messageText: 'Where can I find my onboarding checklist?',
    confidenceScore: null,
    metadata: {},
    createdAt: '2026-05-20T10:00:00.000Z',
  },
  {
    id: 'd3000000-0000-4000-8000-000000000002',
    sessionId: CHAT_SESSION_FIXTURE_ID,
    senderType: 'bot',
    messageText:
      'Open the Checklist page from the sidebar to view tasks assigned to your role.',
    confidenceScore: 0.92,
    metadata: { source: 'faq' },
    createdAt: '2026-05-20T10:00:01.000Z',
  },
  {
    id: 'd3000000-0000-4000-8000-000000000003',
    sessionId: CHAT_SESSION_FIXTURE_ID,
    senderType: 'user',
    messageText: 'When does benefits enrollment start?',
    confidenceScore: null,
    metadata: {},
    createdAt: '2026-05-20T10:05:00.000Z',
  },
  {
    id: 'd3000000-0000-4000-8000-000000000004',
    sessionId: CHAT_SESSION_FIXTURE_ID,
    senderType: 'bot',
    messageText:
      'Enrollment opens on your start date and remains open for 30 days. See the FAQ for plan details.',
    confidenceScore: 0.88,
    metadata: { source: 'faq' },
    createdAt: '2026-05-20T10:05:01.000Z',
  },
];

export function buildChatFixture(userId = 'a1000000-0000-4000-8000-000000000001'): ChatFixtureData {
  return {
    session: {
      id: CHAT_SESSION_FIXTURE_ID,
      userId,
      status: 'open',
      escalated: false,
      createdAt: '2026-05-20T10:00:00.000Z',
      updatedAt: '2026-05-20T10:05:01.000Z',
    },
    messages: fixtureMessages,
  };
}
