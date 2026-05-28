import { formatChatTimestamp } from '@/features/chatbot/chatbot.logic';
import type { ChatMessage } from '@/features/chatbot/chatbot.types';

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-sm text-slate-500">
        Ask about benefits, IT setup, payroll, or onboarding tasks.
      </p>
    );
  }

  return (
    <ul className="flex max-h-80 flex-col gap-3 overflow-y-auto px-4 py-3" aria-live="polite">
      {messages.map((message) => {
        const isUser = message.senderType === 'user';
        return (
          <li
            key={message.id}
            className={['flex', isUser ? 'justify-end' : 'justify-start'].join(' ')}
          >
            <div
              className={[
                'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                isUser
                  ? 'bg-brand-600 text-white'
                  : message.senderType === 'hr'
                    ? 'bg-amber-50 text-amber-950 ring-1 ring-amber-200'
                    : 'bg-slate-100 text-slate-800',
              ].join(' ')}
            >
              <p className="text-xs font-medium opacity-80">
                {isUser ? 'You' : message.senderType === 'hr' ? 'HR' : 'Assistant'}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{message.messageText}</p>
              {!isUser && message.confidenceScore !== null ? (
                <p className="mt-1 text-xs opacity-70">
                  Confidence: {Math.round(message.confidenceScore * 100)}%
                </p>
              ) : null}
              <p className="mt-1 text-xs opacity-70">{formatChatTimestamp(message.createdAt)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
