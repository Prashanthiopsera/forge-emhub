import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { buildChatFixture } from '@/features/chatbot/chatbot.fixtures';
import { ChatWidget } from '@/features/chatbot/ChatWidget';

vi.mock('@/features/chatbot/useChat', () => ({
  useChat: vi.fn(),
}));

import { useChat } from '@/features/chatbot/useChat';

const mockUseChat = vi.mocked(useChat);

describe('ChatWidget (WO-020)', () => {
  it('opens panel and shows messages from hook', () => {
    const fixture = buildChatFixture();
    mockUseChat.mockReturnValue({
      session: fixture.session,
      messages: fixture.messages,
      loading: false,
      sending: false,
      error: null,
      source: 'fixture',
      sendMessage: vi.fn(),
      escalate: vi.fn(),
      reload: undefined,
    });

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole('button', { name: 'Open onboarding assistant' }));
    expect(screen.getByLabelText('Onboarding assistant chat')).toBeInTheDocument();
    expect(screen.getByText(/onboarding checklist/i)).toBeInTheDocument();
  });
});
