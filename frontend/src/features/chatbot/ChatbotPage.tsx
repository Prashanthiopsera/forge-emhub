import { useState } from 'react';
import { formatChatTimestamp } from '@/features/chatbot/chatbot.logic';
import { useChatbot } from '@/features/chatbot/useChatbot';
import { LLM_STUB_DISCLAIMER } from '@/features/chatbot/respond';
import { chatResponsesRemaining } from '@/features/chatbot/rateLimit';
import { useAuth } from '@/features/auth/AuthContext';

export function ChatbotPage() {
  const { user } = useAuth();
  const { session, messages, loading, sending, error, source, sendMessage, escalate } =
    useChatbot();
  const [draft, setDraft] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = draft;
    setDraft('');
    await sendMessage(text);
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Loading assistant…</p>;
  }

  if (!user) {
    return (
      <section aria-labelledby="chatbot-signin">
        <h1 id="chatbot-signin" className="text-2xl font-semibold text-slate-900">
          AI Assistant
        </h1>
        <p className="mt-2 text-slate-600">Sign in to chat with the onboarding assistant.</p>
      </section>
    );
  }

  const remaining = chatResponsesRemaining(user.id);

  return (
    <section aria-labelledby="chatbot-title" className="flex h-[calc(100vh-12rem)] flex-col gap-4">
      <header>
        <h1 id="chatbot-title" className="text-2xl font-semibold text-slate-900">
          AI Assistant
        </h1>
        <p className="mt-1 text-slate-600">
          FAQ-backed answers with rate limiting ({remaining} responses left this hour).
        </p>
        <p className="mt-1 text-xs text-slate-500">{LLM_STUB_DISCLAIMER}</p>
        {error ? (
          <p className="mt-2 text-sm text-amber-700" role="status">
            {error}
          </p>
        ) : null}
        {source === 'fixture' ? (
          <p className="mt-2 text-sm text-slate-500" role="status">
            Showing demo chat data.
          </p>
        ) : null}
      </header>

      <div
        className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((message) => (
          <article
            key={message.id}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              message.senderType === 'user'
                ? 'ml-auto bg-brand-600 text-white'
                : message.senderType === 'hr'
                  ? 'bg-amber-50 text-amber-950 ring-1 ring-amber-200'
                  : 'bg-slate-100 text-slate-900'
            }`}
          >
            <p className="font-medium text-xs opacity-80">
              {message.senderType === 'user'
                ? 'You'
                : message.senderType === 'hr'
                  ? 'HR'
                  : 'Assistant'}
              {message.metadata.source ? ` · ${message.metadata.source}` : ''}
            </p>
            <p className="mt-1 whitespace-pre-wrap">{message.messageText}</p>
            <p className="mt-1 text-xs opacity-70">{formatChatTimestamp(message.createdAt)}</p>
          </article>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <label className="sr-only" htmlFor="chat-input">
          Message
        </label>
        <input
          id="chat-input"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about benefits, IT setup, payroll…"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          disabled={sending || session?.escalated}
        />
        <button
          type="submit"
          disabled={sending || !draft.trim() || session?.escalated}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void escalate()}
          disabled={session?.escalated}
          className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 disabled:opacity-50"
        >
          {session?.escalated ? 'Escalated to HR' : 'Escalate to HR'}
        </button>
        {session?.escalated ? (
          <p className="text-sm text-amber-800">
            HR will reply here. You can still read previous messages.
          </p>
        ) : null}
      </div>
    </section>
  );
}
