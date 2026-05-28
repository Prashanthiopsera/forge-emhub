export type ChatSenderType = 'user' | 'bot' | 'hr';

export type ChatbotSource = 'supabase' | 'fixture';

export interface ChatMessageMetadata {
  source?: string;
  article_id?: string;
  disclaimer?: string;
  [key: string]: string | undefined;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderType: ChatSenderType;
  messageText: string;
  confidenceScore: number | null;
  metadata: ChatMessageMetadata;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  status: string;
  escalated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatFixtureData {
  session: ChatSession;
  messages: ChatMessage[];
}

export interface ChatSessionView extends ChatSession {
  employeeName?: string;
  employeeEmail?: string;
  lastMessagePreview?: string;
}
