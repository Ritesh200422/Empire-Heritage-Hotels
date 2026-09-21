import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { feedbackRequestSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';
import { createRequestLogger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const requestId = uuidv4();
  const log = createRequestLogger(requestId);

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { type: 'error', message: 'Invalid JSON in request body', requestId },
        { status: 400 }
      );
    }

    const parseResult = feedbackRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { type: 'error', message: 'Validation error', requestId },
        { status: 400 }
      );
    }

    const { messageId, rating, comment } = parseResult.data;

    const rateLimitKey = request.headers.get('x-forwarded-for') || 'feedback-unknown';
    const rateLimitResult = checkRateLimit(rateLimitKey);
    if (rateLimitResult) {
      return NextResponse.json(
        { type: 'error', message: 'Too many requests.', requestId },
        { status: 429 }
      );
    }

    await prisma.feedback.create({
      data: {
        messageId,
        rating,
        comment,
      },
    });

    log.info({ messageId, rating }, 'Feedback saved');

    return NextResponse.json({ success: true, requestId }, { status: 200 });
  } catch (error) {
    log.error({ err: error }, 'Feedback error');
    return NextResponse.json(
      { type: 'error', message: 'Internal Server Error', requestId },
      { status: 500 }
    );
  }
}
