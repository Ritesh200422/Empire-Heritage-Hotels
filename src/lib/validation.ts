import { z } from 'zod';

export const chatRequestSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required').max(100),
  message: z.string().min(1, 'message is required').max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .optional(),
  availabilityForm: z
    .object({
      checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'checkIn must be YYYY-MM-DD'),
      checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'checkOut must be YYYY-MM-DD'),
      adults: z.number().int().min(1).max(6),
    })
    .optional(),
});

export type ChatRequestBody = z.infer<typeof chatRequestSchema>;

export const feedbackRequestSchema = z.object({
  messageId: z.string().min(1, 'messageId is required').max(100),
  rating: z.enum(['up', 'down']),
  comment: z.string().max(1000).optional(),
});

export type FeedbackRequestBody = z.infer<typeof feedbackRequestSchema>;
