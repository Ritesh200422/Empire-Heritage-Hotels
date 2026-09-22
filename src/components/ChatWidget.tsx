'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChatMessage, type Message } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SuggestedChips } from './SuggestedChips';
import { AvailabilityForm } from './AvailabilityForm';
import { RoomCards } from './RoomCards';
import { TypingIndicator } from './TypingIndicator';
import type { ChatResponse, MissingField } from '../lib/types';

function generateId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = localStorage.getItem('hotel-chat-session');
  if (!sessionId) {
    sessionId = generateId();
    localStorage.setItem('hotel-chat-session', sessionId);
  }
  return sessionId;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Welcome to Empire Heritage Hotels! 🌊 I\'m Royal Guard AI. I can help you with room availability, hotel amenities, policies, and more. How can I assist you today?',
      type: 'answer',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [missingFields, setMissingFields] = useState<MissingField[]>([]);
  const [prefillData, setPrefillData] = useState<Partial<{ checkIn: string; checkOut: string; adults: number }>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen, scrollToBottom]);

  const sendMessage = async (content: string, availabilityForm?: { checkIn: string; checkOut: string; adults: number }) => {
    const sessionId = getSessionId();
    setIsLoading(true);
    setLastFailedMessage(null);

    if (!availabilityForm) {
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        type: 'answer',
      };
      setMessages((prev) => [...prev, userMessage]);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: content,
          availabilityForm,
        }),
      });

      const data: ChatResponse = await response.json();

      const assistantMessage: Message = {
        id: data.requestId || generateId(),
        role: 'assistant',
        content: data.message,
        type: data.type,
        mode: data.mode,
        availability: data.availability,
        alternatives: data.alternatives,
        missingFields: data.missingFields,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.type === 'availability_request' && data.missingFields) {
        setMissingFields(data.missingFields);
        setShowAvailabilityForm(true);
      } else {
        setShowAvailabilityForm(false);
      }
    } catch {
      setLastFailedMessage(content);
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Network error. Please check your connection and try again.',
        type: 'error',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      setMessages((prev) => prev.slice(0, -1));
      sendMessage(lastFailedMessage);
    }
  };

  const handleChipClick = (question: string) => {
    sendMessage(question);
  };

  const handleAvailabilitySubmit = (form: { checkIn: string; checkOut: string; adults: number }) => {
    setShowAvailabilityForm(false);
    setPrefillData({});

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: `Check availability: ${form.checkIn} to ${form.checkOut}, ${form.adults} adult${form.adults > 1 ? 's' : ''}`,
      type: 'answer',
    };
    setMessages((prev) => [...prev, userMsg]);

    sendMessage(
      `Check availability for ${form.adults} adults from ${form.checkIn} to ${form.checkOut}`,
      form,
    );
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 w-16 h-16 rounded-full bg-[#4a1c1c] p-1.5 text-white shadow-[0_8px_30px_rgba(74,28,28,0.45)] ring-2 ring-[#b8860b]/70 hover:scale-105 hover:shadow-[0_10px_36px_rgba(74,28,28,0.6)] transition-all duration-200 flex items-center justify-center z-50"
          aria-label="Open Royal Guard AI"
        >
          <Image
            src="/royal-guard-ai.png"
            alt=""
            width={64}
            height={64}
            className="h-full w-full rounded-full object-cover"
          />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full h-full sm:w-[400px] sm:h-[600px] bg-white sm:rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-slate-200">
          {/* Header */}
          <header className="bg-[#4a1c1c] px-4 py-3 flex items-center justify-between flex-shrink-0 text-white">
            <div className="flex items-center gap-3">
              <Image
                src="/concierge-bot.png"
                alt="Royal Guard AI"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <h2 className="text-sm font-semibold">Royal Guard AI</h2>
                <p className="text-xs opacity-80">Always here to help</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50" role="log" aria-live="polite">
            <div className="space-y-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} onRetry={msg.type === 'error' ? handleRetry : undefined} />
              ))}

              {messages.length > 0 &&
                messages[messages.length - 1].type === 'availability_result' &&
                (messages[messages.length - 1].availability || messages[messages.length - 1].alternatives) && (
                  <RoomCards 
                    availability={messages[messages.length - 1].availability!} 
                    alternatives={messages[messages.length - 1].alternatives}
                    onAlternativeClick={handleAvailabilitySubmit}
                  />
                )}

              {showAvailabilityForm && (
                <AvailabilityForm
                  missingFields={missingFields}
                  prefillData={prefillData}
                  onSubmit={handleAvailabilitySubmit}
                  onCancel={() => setShowAvailabilityForm(false)}
                />
              )}

              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="px-4 pb-2 bg-slate-50 flex-shrink-0">
            <SuggestedChips onChipClick={handleChipClick} disabled={isLoading} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 bg-white border-t border-slate-200 flex-shrink-0">
            <ChatInput onSend={sendMessage} disabled={isLoading} />
          </div>
        </div>
      )}
    </>
  );
}
