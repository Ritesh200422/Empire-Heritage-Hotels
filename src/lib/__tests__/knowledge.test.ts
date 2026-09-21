import { describe, it, expect } from 'vitest';
import { matchFaqByKeywords } from '@/lib/knowledge';

const sampleFaqs = [
  {
    id: 'faq-checkin-time',
    question: 'What time is check-in and check-out?',
    answer: 'Check-in is at 2:00 PM (14:00) and check-out is at 11:00 AM.',
    tags: ['check-in', 'check-out', 'time', 'hours'],
  },
  {
    id: 'faq-pool',
    question: 'Does the hotel have a pool?',
    answer: 'Yes! We have a heated infinity pool.',
    tags: ['pool', 'swimming', 'amenities'],
  },
  {
    id: 'faq-breakfast',
    question: 'Is breakfast included in the room rate?',
    answer: 'Breakfast is NOT included. Available for $25/person.',
    tags: ['breakfast', 'food', 'dining', 'included'],
  },
  {
    id: 'faq-cancellation',
    question: 'What is the cancellation policy?',
    answer: 'Free cancellation up to 48 hours before check-in.',
    tags: ['cancellation', 'cancel', 'refund', 'policy'],
  },
  {
    id: 'faq-pets',
    question: 'Can I bring my pet?',
    answer: 'Small pets under 10 kg are welcome for $30/night.',
    tags: ['pets', 'dog', 'cat', 'animals'],
  },
];

describe('matchFaqByKeywords', () => {
  it('matches query about pool', () => {
    const result = matchFaqByKeywords('Do you have a swimming pool?', sampleFaqs);
    expect(result).not.toBeNull();
    expect(result!.sourceId).toBe('faq-pool');
  });

  it('matches query about check-in time', () => {
    const result = matchFaqByKeywords('What time is check-in?', sampleFaqs);
    expect(result).not.toBeNull();
    expect(result!.sourceId).toBe('faq-checkin-time');
  });

  it('matches query about breakfast', () => {
    const result = matchFaqByKeywords('Is breakfast included?', sampleFaqs);
    expect(result).not.toBeNull();
    expect(result!.sourceId).toBe('faq-breakfast');
  });

  it('matches query about cancellation', () => {
    const result = matchFaqByKeywords('Can I cancel my reservation?', sampleFaqs);
    expect(result).not.toBeNull();
    expect(result!.sourceId).toBe('faq-cancellation');
  });

  it('matches query about pets', () => {
    const result = matchFaqByKeywords('Can I bring my dog?', sampleFaqs);
    expect(result).not.toBeNull();
    expect(result!.sourceId).toBe('faq-pets');
  });

  it('returns null for unmatched query', () => {
    const result = matchFaqByKeywords('How tall is Mount Everest?', sampleFaqs);
    expect(result).toBeNull();
  });

  it('returns null for very short unmatched query', () => {
    const result = matchFaqByKeywords('hi', sampleFaqs);
    expect(result).toBeNull();
  });
});
