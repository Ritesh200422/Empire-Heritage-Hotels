import { describe, it, expect } from 'vitest';
import { chatRequestSchema, feedbackRequestSchema } from '@/lib/validation';

describe('chatRequestSchema', () => {
  it('accepts valid request', () => {
    const result = chatRequestSchema.safeParse({
      sessionId: 'test-session-123',
      message: 'What time is check-in?',
    });
    expect(result.success).toBe(true);
  });

  it('accepts request with history', () => {
    const result = chatRequestSchema.safeParse({
      sessionId: 'test-session-123',
      message: 'And what about check-out?',
      history: [
        { role: 'user', content: 'What time is check-in?' },
        { role: 'assistant', content: 'Check-in is at 2 PM.' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts request with availability form', () => {
    const result = chatRequestSchema.safeParse({
      sessionId: 'test-session-123',
      message: 'Check availability',
      availabilityForm: {
        checkIn: '2027-06-15',
        checkOut: '2027-06-18',
        adults: 2,
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty sessionId', () => {
    const result = chatRequestSchema.safeParse({
      sessionId: '',
      message: 'Hello',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty message', () => {
    const result = chatRequestSchema.safeParse({
      sessionId: 'test-session',
      message: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing sessionId', () => {
    const result = chatRequestSchema.safeParse({
      message: 'Hello',
    });
    expect(result.success).toBe(false);
  });

  it('rejects message over 2000 chars', () => {
    const result = chatRequestSchema.safeParse({
      sessionId: 'test',
      message: 'a'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format in availability form', () => {
    const result = chatRequestSchema.safeParse({
      sessionId: 'test',
      message: 'Check',
      availabilityForm: {
        checkIn: '06/15/2027',
        checkOut: '2027-06-18',
        adults: 2,
      },
    });
    expect(result.success).toBe(false);
  });

  it('rejects adults out of range', () => {
    const result = chatRequestSchema.safeParse({
      sessionId: 'test',
      message: 'Check',
      availabilityForm: {
        checkIn: '2027-06-15',
        checkOut: '2027-06-18',
        adults: 7,
      },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid history role', () => {
    const result = chatRequestSchema.safeParse({
      sessionId: 'test',
      message: 'Hello',
      history: [{ role: 'system', content: 'test' }],
    });
    expect(result.success).toBe(false);
  });
});

describe('feedbackRequestSchema', () => {

  it('accepts valid feedback', () => {
    expect(
      feedbackRequestSchema.safeParse({ messageId: 'msg-1', rating: 'up' }).success
    ).toBe(true);
    expect(
      feedbackRequestSchema.safeParse({ messageId: 'msg-2', rating: 'down', comment: 'Wrong' }).success
    ).toBe(true);
  });

  it('rejects invalid ratings', () => {
    expect(
      feedbackRequestSchema.safeParse({ messageId: 'msg-1', rating: 'maybe' }).success
    ).toBe(false);
  });

  it('rejects missing messageId', () => {
    expect(
      feedbackRequestSchema.safeParse({ rating: 'up' }).success
    ).toBe(false);
  });
});
