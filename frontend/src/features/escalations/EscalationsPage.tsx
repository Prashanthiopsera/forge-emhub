import { useState } from 'react';
import { formatChatTimestamp } from '@/features/chatbot/chatbot.logic';
import { useEscalations } from '@/features/escalations/useEscalations';

export function EscalationsPage() {
  const {
    sessions,
    selected,
    selectedId,
    setSelectedId,
    messages,
    loading,
    replying,
    error,
    sendReply,
    resolve,
    previewFor,
  } = useEscalations();
  const [replyDraft, setReplyDraft] = useState('');

  async function handleReply(event: React.FormEvent) {
    event.preventDefault();
    const text = replyDraft;
    setReplyDraft('');
    await sendReply(text);
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Loading escalation queue…</p>;
  }

  return (
    <section aria-labelledby="escalations-title" className="space-y-6">
      <header>
        <h1 id="escalations-title" className="text-2xl font-semibold text-slate-900">
          HR Escalations
        </h1>
        <p className="mt-1 text-slate-600">
          Respond to employees who escalated from the onboarding chatbot.
        </p>
        {error ? (
          <p className="mt-2 text-sm text-amber-700" role="status">
            {error}
          </p>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <aside className="rounded-xl border border-slate-200 bg-white">
          <h2 className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">
            Open queue ({sessions.length})
          </h2>
          {sessions.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-600">No open escalations.</p>
          ) : (
            <ul>
              {sessions.map((session) => (
                <li key={session.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(session.id)}
                    className={`w-full border-b border-slate-100 px-4 py-3 text-left text-sm hover:bg-slate-50 ${
                      selectedId === session.id ? 'bg-brand-50' : ''
                    }`}
                  >
                    <span className="font-medium text-slate-900">
                      {session.employeeName ?? session.employeeEmail ?? session.userId}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Updated {formatChatTimestamp(session.updatedAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          {!selected ? (
            <p className="text-sm text-slate-600">Select an escalation to view the thread.</p>
          ) : (
            <>
              <header className="mb-4 border-b border-slate-100 pb-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  {selected.employeeName ?? 'Employee'}
                </h2>
                <p className="text-sm text-slate-600">{selected.employeeEmail}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Last employee message: {previewFor(messages) || '—'}
                </p>
              </header>

              <div className="mb-4 max-h-80 space-y-2 overflow-y-auto" role="log">
                {messages.map((message) => (
                  <article
                    key={message.id}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      message.senderType === 'hr'
                        ? 'bg-amber-50 text-amber-950'
                        : message.senderType === 'user'
                          ? 'bg-slate-100'
                          : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                      {message.senderType}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{message.messageText}</p>
                  </article>
                ))}
              </div>

              <form onSubmit={handleReply} className="flex gap-2">
                <label className="sr-only" htmlFor="hr-reply">
                  HR reply
                </label>
                <input
                  id="hr-reply"
                  type="text"
                  value={replyDraft}
                  onChange={(event) => setReplyDraft(event.target.value)}
                  placeholder="Type HR response (delivered in employee chat)…"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  disabled={replying}
                />
                <button
                  type="submit"
                  disabled={replying || !replyDraft.trim()}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Send
                </button>
              </form>

              <button
                type="button"
                onClick={() => void resolve()}
                className="mt-3 text-sm text-slate-600 underline hover:text-slate-900"
              >
                Mark resolved
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
