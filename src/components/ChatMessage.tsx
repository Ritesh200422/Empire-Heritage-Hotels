import { useState } from 'react';
import Image from 'next/image';
import type { AvailabilityResult, ChatResponseType, MissingField } from '@/lib/types';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: ChatResponseType;
  mode?: 'ai' | 'degraded' | 'fallback';
  availability?: AvailabilityResult;
  alternatives?: import('@/lib/types').Alternative[];
  missingFields?: MissingField[];
}

interface ChatMessageProps {
  message: Message;
  onRetry?: () => void;
}

export function ChatMessage({ message, onRetry }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isFallback = message.type === 'fallback';
  const isError = message.type === 'error';

  const [feedbackState, setFeedbackState] = useState<'idle' | 'submitting' | 'submitted'>('idle');

  const handleFeedback = async (rating: 'up' | 'down') => {
    if (feedbackState !== 'idle') return;
    setFeedbackState('submitting');
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: message.id, rating })
      });
      setFeedbackState('submitted');
    } catch {
      setFeedbackState('idle');
    }
  };

  return (
    <div
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
      role="article"
      aria-label={`${isUser ? 'You' : 'Assistant'}: ${message.content}`}
    >
      <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <Image
            src="/concierge-bot.png"
            alt="Royal Guard AI"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover flex-shrink-0"
          />
        )}
        <div
          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : isError
              ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-md'
              : isFallback
                ? 'bg-amber-50 text-amber-900 border border-amber-200 rounded-bl-md'
                : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-md'
          }`}
      >
        {isFallback && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 mb-1 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Limited confidence
          </div>
        )}
        {isError && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 mb-1 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Error
          </div>
        )}

        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

        {isError && onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs font-medium text-red-700 hover:text-red-900 underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
            aria-label="Retry sending message"
          >
            Retry
          </button>
        )}
        </div>
      </div>

      {!isUser && !isError && message.mode && (
        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleFeedback('up')}
              disabled={feedbackState !== 'idle'}
              className="hover:text-green-600 disabled:opacity-50"
            >
              👍
            </button>
            <button
              onClick={() => handleFeedback('down')}
              disabled={feedbackState !== 'idle'}
              className="hover:text-red-600 disabled:opacity-50"
            >
              👎
            </button>
            {feedbackState === 'submitted' && <span className="text-[10px] text-green-600 ml-1">Thanks!</span>}
          </div>
        </div>
      )}


    </div>
  );
}
