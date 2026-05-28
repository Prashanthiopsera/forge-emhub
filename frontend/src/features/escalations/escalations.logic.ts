import type { ChatSessionView } from '@/features/chatbot/chatbot.types';

export function filterOpenEscalations(sessions: ChatSessionView[]): ChatSessionView[] {
  return sessions.filter((session) => session.escalated && session.status === 'open');
}

export function sortEscalationsByUpdated(sessions: ChatSessionView[]): ChatSessionView[] {
  return [...sessions].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}
