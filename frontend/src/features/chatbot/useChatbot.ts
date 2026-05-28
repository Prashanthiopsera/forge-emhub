import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { buildChatFixture } from '@/features/chatbot/chatbot.fixtures';
import { sortMessagesChronologically } from '@/features/chatbot/chatbot.logic';
import type {
  ChatMessage,
  ChatMessageMetadata,
  ChatSession,
  ChatbotSource,
} from '@/features/chatbot/chatbot.types';
import {
  buildChatResponse,
  buildRateLimitedResponse,
  messageMetadataFromResult,
  toChatArticleMatches,
} from '@/features/chatbot/respond';
import { isChatRateLimited, recordChatBotResponse } from '@/features/chatbot/rateLimit';
import { fetchFaqFromSupabase } from '@/features/faq/useFaqSearch';
import { buildFaqFixture } from '@/features/faq/faq.fixtures';
import { getSupabase } from '@/lib/supabase';

interface ChatSessionRow {
  id: string;
  user_id: string;
  status: string;
  escalated: boolean;
  created_at: string;
  updated_at: string;
}

interface ChatMessageRow {
  id: string;
  session_id: string;
  sender_type: 'user' | 'bot' | 'hr';
  message_text: string;
  confidence_score: number | null;
  metadata: ChatMessageMetadata | null;
  created_at: string;
}

function mapSession(row: ChatSessionRow): ChatSession {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    escalated: row.escalated,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    sessionId: row.session_id,
    senderType: row.sender_type,
    messageText: row.message_text,
    confidenceScore: row.confidence_score,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

export async function ensureChatSession(userId: string): Promise<ChatSession | null> {
  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from('chat_sessions')
    .select('id, user_id, status, escalated, created_at, updated_at')
    .eq('user_id', userId)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return mapSession(existing as ChatSessionRow);

  const { data: created, error } = await supabase
    .from('chat_sessions')
    .insert({ user_id: userId, status: 'open' })
    .select('id, user_id, status, escalated, created_at, updated_at')
    .single();

  if (error || !created) return null;
  return mapSession(created as ChatSessionRow);
}

export async function fetchChatMessages(sessionId: string): Promise<ChatMessage[] | null> {
  const { data, error } = await getSupabase()
    .from('chat_messages')
    .select('id, session_id, sender_type, message_text, confidence_score, metadata, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error || !data) return null;
  return (data as ChatMessageRow[]).map(mapMessage);
}

async function insertChatMessage(
  sessionId: string,
  senderType: 'user' | 'bot' | 'hr',
  messageText: string,
  confidenceScore: number | null,
  metadata: ChatMessageMetadata,
): Promise<ChatMessage | null> {
  const { data, error } = await getSupabase()
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      sender_type: senderType,
      message_text: messageText,
      confidence_score: confidenceScore,
      metadata,
    })
    .select('id, session_id, sender_type, message_text, confidence_score, metadata, created_at')
    .single();

  if (error || !data) return null;
  return mapMessage(data as ChatMessageRow);
}

export async function escalateChatSession(
  sessionId: string,
  userId: string,
): Promise<{ error: Error | null }> {
  const supabase = getSupabase();

  const { error: sessionError } = await supabase
    .from('chat_sessions')
    .update({ escalated: true, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (sessionError) return { error: new Error(sessionError.message) };

  const { error: notifyError } = await supabase.from('notifications').insert({
    channel: 'in_app',
    target_role: 'hr_admin',
    status: 'pending',
    payload: {
      type: 'escalation',
      session_id: sessionId,
      title: 'Chat escalation',
      body: 'An employee requested HR assistance in the onboarding chatbot.',
      link: '/admin/escalations',
    },
  });

  return { error: notifyError ? new Error(notifyError.message) : null };
}

export function useChatbot() {
  const { user } = useAuth();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [source, setSource] = useState<ChatbotSource>('fixture');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const remoteSession = await ensureChatSession(userId);
      if (remoteSession) {
        const remoteMessages = await fetchChatMessages(remoteSession.id);
        setSession(remoteSession);
        setMessages(sortMessagesChronologically(remoteMessages ?? []));
        setSource('supabase');
        return;
      }

      const fixture = buildChatFixture(userId);
      setSession(fixture.session);
      setMessages(fixture.messages);
      setSource('fixture');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load chat';
      setError(message);
      const fixture = buildChatFixture(userId);
      setSession(fixture.session);
      setMessages(fixture.messages);
      setSource('fixture');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setSession(null);
      setMessages([]);
      setLoading(false);
      return;
    }
    void load(user.id);
  }, [user?.id, load]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!user?.id || !session || !text.trim()) return;

      const trimmed = text.trim();
      setSending(true);
      setError(null);

      const optimisticUser: ChatMessage = {
        id: `local-user-${Date.now()}`,
        sessionId: session.id,
        senderType: 'user',
        messageText: trimmed,
        confidenceScore: null,
        metadata: {},
        createdAt: new Date().toISOString(),
      };
      setMessages((current) => [...current, optimisticUser]);

      try {
        if (source === 'supabase') {
          const userRow = await insertChatMessage(session.id, 'user', trimmed, null, {});
          if (!userRow) throw new Error('Failed to save message');

          const rateKey = user.id;
          let result;
          if (isChatRateLimited(rateKey)) {
            result = buildRateLimitedResponse();
          } else {
            recordChatBotResponse(rateKey);
            const faqData = (await fetchFaqFromSupabase('')) ?? buildFaqFixture();
            result = buildChatResponse(trimmed, toChatArticleMatches(faqData.articles));
          }

          const botRow = await insertChatMessage(
            session.id,
            'bot',
            result.text,
            result.confidenceScore ?? null,
            messageMetadataFromResult(result),
          );
          if (!botRow) throw new Error('Failed to save bot reply');

          const refreshed = await fetchChatMessages(session.id);
          setMessages(sortMessagesChronologically(refreshed ?? [userRow, botRow]));
          return;
        }

        const faqData = buildFaqFixture();
        const result = isChatRateLimited(user.id)
          ? buildRateLimitedResponse()
          : (() => {
              recordChatBotResponse(user.id);
              return buildChatResponse(trimmed, toChatArticleMatches(faqData.articles));
            })();

        const botMessage: ChatMessage = {
          id: `local-bot-${Date.now()}`,
          sessionId: session.id,
          senderType: 'bot',
          messageText: result.text,
          confidenceScore: result.confidenceScore ?? null,
          metadata: messageMetadataFromResult(result),
          createdAt: new Date().toISOString(),
        };
        setMessages((current) => [...current, botMessage]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      } finally {
        setSending(false);
      }
    },
    [user?.id, session, source],
  );

  const escalate = useCallback(async () => {
    if (!user?.id || !session) return;

    if (source === 'supabase') {
      const { error: escalateError } = await escalateChatSession(session.id, user.id);
      if (escalateError) {
        setError(escalateError.message);
        return;
      }
      setSession({ ...session, escalated: true });
      return;
    }

    setSession({ ...session, escalated: true });
  }, [user?.id, session, source]);

  return {
    session,
    messages,
    loading,
    sending,
    error,
    source,
    sendMessage,
    escalate,
    reload: () => (user?.id ? load(user.id) : undefined),
  };
}
