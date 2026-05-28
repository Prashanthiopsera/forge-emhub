import { useState } from 'react';
import { MessageInput } from '@/features/chatbot/MessageInput';
import { MessageList } from '@/features/chatbot/MessageList';
import { useChat } from '@/features/chatbot/useChat';

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { messages, loading, sending, error, source, session, sendMessage } = useChat();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {open ? (
        <section
          className="flex w-96 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
          aria-label="Onboarding assistant chat"
        >
          <header className="flex items-center justify-between border-b border-slate-200 bg-brand-600 px-4 py-3 text-white">
            <div>
              <h2 className="text-sm font-semibold">Onboarding Assistant</h2>
              <p className="text-xs text-brand-100">24/7 instant answers</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-1 text-sm hover:bg-brand-700"
              aria-label="Close chat"
            >
              ✕
            </button>
          </header>

          {loading ? (
            <p className="px-4 py-6 text-sm text-slate-600">Loading conversation…</p>
          ) : (
            <MessageList messages={messages} />
          )}

          {error ? (
            <p className="px-4 pb-2 text-xs text-amber-700" role="status">
              {error}
            </p>
          ) : null}
          {source === 'fixture' && !error ? (
            <p className="px-4 pb-2 text-xs text-slate-500" role="status">
              Demo chat data
            </p>
          ) : null}

          <MessageInput
            onSend={(text) => void sendMessage(text)}
            disabled={loading || sending || session?.escalated}
          />
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-2xl text-white shadow-lg hover:bg-brand-700"
        aria-expanded={open}
        aria-label={open ? 'Close onboarding assistant' : 'Open onboarding assistant'}
      >
        💬
      </button>
    </div>
  );
}
