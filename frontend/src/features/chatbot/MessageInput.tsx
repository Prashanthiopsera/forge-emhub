import { useState } from 'react';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [draft, setDraft] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setDraft('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 p-3">
      <label htmlFor="chat-message-input" className="sr-only">
        Message
      </label>
      <input
        id="chat-message-input"
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Ask a question…"
        disabled={disabled}
        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !draft.trim()}
        className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}
