import { useCallback, useEffect, useState } from 'react';
import { lastUserMessagePreview } from '@/features/chatbot/chatbot.logic';
import type { ChatMessage, ChatSessionView } from '@/features/chatbot/chatbot.types';
import { fetchChatMessages } from '@/features/chatbot/useChatbot';
import {
  filterOpenEscalations,
  sortEscalationsByUpdated,
} from '@/features/escalations/escalations.logic';
import { getSupabase } from '@/lib/supabase';

interface EscalatedSessionRow {
  id: string;
  user_id: string;
  status: string;
  escalated: boolean;
  created_at: string;
  updated_at: string;
  profiles: { full_name: string; email: string } | { full_name: string; email: string }[] | null;
}

export async function fetchEscalatedSessions(): Promise<ChatSessionView[] | null> {
  const { data, error } = await getSupabase()
    .from('chat_sessions')
    .select(
      'id, user_id, status, escalated, created_at, updated_at, profiles(full_name, email)',
    )
    .eq('escalated', true)
    .eq('status', 'open')
    .order('updated_at', { ascending: false });

  if (error || !data) return null;

  return (data as EscalatedSessionRow[]).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id,
      userId: row.user_id,
      status: row.status,
      escalated: row.escalated,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      employeeName: profile?.full_name,
      employeeEmail: profile?.email,
    };
  });
}

export async function sendHrReply(sessionId: string, messageText: string): Promise<Error | null> {
  const trimmed = messageText.trim();
  if (!trimmed) return new Error('Reply cannot be empty');

  const { error } = await getSupabase().from('chat_messages').insert({
    session_id: sessionId,
    sender_type: 'hr',
    message_text: trimmed,
    confidence_score: 1,
    metadata: { source: 'hr_reply' },
  });

  if (error) return new Error(error.message);

  await getSupabase()
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId);

  return null;
}

export async function resolveEscalation(sessionId: string): Promise<Error | null> {
  const { error } = await getSupabase()
    .from('chat_sessions')
    .update({ status: 'resolved', updated_at: new Date().toISOString() })
    .eq('id', sessionId);

  return error ? new Error(error.message) : null;
}

export function useEscalations() {
  const [sessions, setSessions] = useState<ChatSessionView[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const remote = await fetchEscalatedSessions();
      const open = sortEscalationsByUpdated(filterOpenEscalations(remote ?? []));
      setSessions(open);
      setSelectedId((current) => current ?? open[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load escalations');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (sessionId: string) => {
    const remote = await fetchChatMessages(sessionId);
    setMessages(remote ?? []);
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    void loadMessages(selectedId);
  }, [selectedId, loadMessages]);

  const sendReply = useCallback(
    async (text: string) => {
      if (!selectedId) return;
      setReplying(true);
      setError(null);
      const replyError = await sendHrReply(selectedId, text);
      if (replyError) {
        setError(replyError.message);
      } else {
        await loadMessages(selectedId);
        await loadSessions();
      }
      setReplying(false);
    },
    [selectedId, loadMessages, loadSessions],
  );

  const resolve = useCallback(async () => {
    if (!selectedId) return;
    const resolveError = await resolveEscalation(selectedId);
    if (resolveError) {
      setError(resolveError.message);
      return;
    }
    setSelectedId(null);
    await loadSessions();
  }, [selectedId, loadSessions]);

  const selected = sessions.find((session) => session.id === selectedId) ?? null;

  const enrichedSessions = sessions.map((session) => ({
    ...session,
    lastMessagePreview: session.lastMessagePreview,
  }));

  return {
    sessions: enrichedSessions,
    selected,
    selectedId,
    setSelectedId,
    messages,
    loading,
    replying,
    error,
    sendReply,
    resolve,
    reload: loadSessions,
    previewFor: lastUserMessagePreview,
  };
}
