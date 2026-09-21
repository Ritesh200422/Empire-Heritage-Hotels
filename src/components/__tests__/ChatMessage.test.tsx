import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatMessage, type Message } from '@/components/ChatMessage';

describe('ChatMessage', () => {
  it('renders user message on the right', () => {
    const msg: Message = {
      id: '1',
      role: 'user',
      content: 'Hello!',
      type: 'answer',
    };
    render(<ChatMessage message={msg} />);
    expect(screen.getByText('Hello!')).toBeInTheDocument();
  });

  it('renders assistant message', () => {
    const msg: Message = {
      id: '2',
      role: 'assistant',
      content: 'Welcome to the hotel!',
      type: 'answer',
    };
    render(<ChatMessage message={msg} />);
    expect(screen.getByText('Welcome to the hotel!')).toBeInTheDocument();
  });

  it('renders error message with error indicator', () => {
    const msg: Message = {
      id: '3',
      role: 'assistant',
      content: 'Something went wrong',
      type: 'error',
    };
    render(<ChatMessage message={msg} onRetry={() => {}} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('renders fallback message with warning indicator', () => {
    const msg: Message = {
      id: '4',
      role: 'assistant',
      content: "I'm not sure about that.",
      type: 'fallback',
    };
    render(<ChatMessage message={msg} />);
    expect(screen.getByText("I'm not sure about that.")).toBeInTheDocument();
    expect(screen.getByText('Limited confidence')).toBeInTheDocument();
  });

  it('renders retry button only for error messages with onRetry', () => {
    const msgNoRetry: Message = {
      id: '5',
      role: 'assistant',
      content: 'Error',
      type: 'error',
    };
    const { rerender } = render(<ChatMessage message={msgNoRetry} />);
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();

    rerender(<ChatMessage message={msgNoRetry} onRetry={() => {}} />);
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});
