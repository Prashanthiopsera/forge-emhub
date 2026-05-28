import type { ChatMessage } from '@/features/chatbot/chatbot.types';

export function sortMessagesChronologically(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export function formatChatTimestamp(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function lastUserMessagePreview(messages: ChatMessage[]): string {
  const userMessages = messages.filter((message) => message.senderType === 'user');
  const last = userMessages[userMessages.length - 1];
  if (!last) return '';
  return last.messageText.length > 80 ? `${last.messageText.slice(0, 80)}…` : last.messageText;
}
