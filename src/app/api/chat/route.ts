/**
 * POST /api/chat — Main chat endpoint
 *
 * Flow: validate input -> rate limit -> load history from MySQL ->
 * load knowledge base -> call Gemini -> handle tool calls -> return structured response
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { chatRequestSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';
import { loadKnowledgeBase, matchFaqByKeywords, getSourceLabel } from '@/lib/knowledge';
import { callGemini, callGeminiWithToolResult } from '@/lib/gemini';
import { checkAvailability, findRoomsForGuests, suggestAlternatives, AvailabilityError } from '@/lib/availability';
import { createRequestLogger } from '@/lib/logger';
import type { ChatResponse, MissingField } from '@/lib/types';
import type { Content } from '@google/genai';

const FALLBACK_MESSAGE =
  "I'm sorry, I couldn't find a confident answer to your question. For assistance, please contact us at +1 (555) 123-4567 or reservations@grandazure.com.";
const MAX_HISTORY_MESSAGES = 20;

export async function POST(request: NextRequest) {
  const requestId = uuidv4();
  const log = createRequestLogger(requestId);
  const startTime = Date.now();

  try {
    // 1. Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        { type: 'error', mode: 'fallback', message: 'Invalid JSON in request body', requestId },
        400,
      );
    }

    const parseResult = chatRequestSchema.safeParse(body);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
      log.warn({ errors }, 'Validation failed');
      return jsonResponse(
        { type: 'error', mode: 'fallback', message: `Validation error: ${errors.join('; ')}`, requestId },
        400,
      );
    }

    const { sessionId, message, availabilityForm } = parseResult.data;

    // 2. Rate limit check
    const rateLimitKey = sessionId || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = checkRateLimit(rateLimitKey);
    if (rateLimitResult) {
      log.warn({ sessionId }, 'Rate limited');
      return jsonResponse(
        {
          type: 'error',
          mode: 'fallback',
          message: 'Too many requests. Please wait a moment before trying again.',
          requestId,
        },
        429,
      );
    }

    // 3. Load KB early so we have it for form submission as well
    const kb = await loadKnowledgeBase();

    // 4. If availabilityForm is provided, run availability check directly
    if (availabilityForm) {
      return await handleAvailabilityForm(availabilityForm, message, sessionId, requestId, log, kb);
    }

    // 5. Load conversation history from MySQL
    const history = await loadConversationHistory(sessionId);

    // 6. Call Gemini
    let geminiResult;
    try {
      geminiResult = await callGemini(message, history, kb, requestId);
    } catch (error) {
      log.error({ err: error }, 'Gemini call failed, trying degraded mode');
      return await handleDegradedMode(message, kb, sessionId, requestId);
    }

    // 7. Handle result type
    if (geminiResult.type === 'tool_call' && geminiResult.toolCalls) {
      return await handleToolCalls(
        geminiResult.toolCalls,
        message,
        history,
        kb,
        sessionId,
        requestId,
        log,
      );
    }

    if (geminiResult.type === 'fallback' || !geminiResult.confident) {
      log.info({ reason: 'not_confident_or_fallback' }, 'Returning fallback');
      // Try FAQ matching as best-effort
      const faqMatch = matchFaqByKeywords(message, kb.faqs);
      if (faqMatch) {
        await saveMessages(sessionId, message, faqMatch.answer, requestId);
        return jsonResponse({
          type: 'answer',
          mode: 'degraded',
          message: faqMatch.answer,
          sources: [faqMatch.sourceId] as any,
          requestId,
        }, 200, kb);
      }

      await saveMessages(sessionId, message, FALLBACK_MESSAGE, requestId);
      return jsonResponse({
        type: 'fallback',
        mode: 'fallback',
        message: FALLBACK_MESSAGE,
        requestId,
      });
    }

    // Factual answer with empty sources -> fallback
    if (
      geminiResult.usedSourceIds &&
      geminiResult.usedSourceIds.length === 0 &&
      geminiResult.confident
    ) {
      log.info({ reason: 'empty_sources' }, 'Confident but no sources, returning fallback');
      await saveMessages(sessionId, message, FALLBACK_MESSAGE, requestId);
      return jsonResponse({
        type: 'fallback',
        mode: 'fallback',
        message: FALLBACK_MESSAGE,
        requestId,
      });
    }

    // 8. Success - return answer
    const answer = geminiResult.answer!;
    await saveMessages(sessionId, message, answer, requestId);

    const latency = Date.now() - startTime;
    log.info({ latency, type: 'answer' }, 'Chat request completed');

    return jsonResponse({
      type: 'answer',
      mode: 'ai',
      message: answer,
      sources: geminiResult.usedSourceIds as any,
      requestId,
    }, 200, kb);
  } catch (error) {
    log.error({ err: error }, 'Unhandled error in chat route');
    const errorMessage = error instanceof Error ? error.message : '';
    const databaseUnavailable =
      errorMessage.includes('Environment variable not found: DATABASE_URL') ||
      errorMessage.includes("Can't reach database server");

    return jsonResponse(
      {
        type: 'error',
        mode: 'fallback',
        message: databaseUnavailable
          ? 'The hotel database is unavailable. Set DATABASE_URL, start MySQL, run the Prisma migration and seed commands, then restart the development server.'
          : 'An unexpected error occurred. Please try again later.',
        requestId,
      },
      databaseUnavailable ? 503 : 502,
    );
  }
}

/** Handle direct availability form submission */
async function handleAvailabilityForm(
  form: { checkIn: string; checkOut: string; adults: number },
  message: string,
  sessionId: string,
  requestId: string,
  log: ReturnType<typeof createRequestLogger>,
  kb: Awaited<ReturnType<typeof loadKnowledgeBase>>
) {
  try {
    const result = await checkAvailability(form.checkIn, form.checkOut, form.adults);
    let alternatives;
    
    if (result.options.length === 0) {
      alternatives = await suggestAlternatives(form.checkIn, form.checkOut, form.adults);
    }
    
    const responseMessage =
      result.options.length > 0
        ? `I found ${result.options.length} room option(s) available for your dates (${form.checkIn} to ${form.checkOut}, ${form.adults} adult${form.adults > 1 ? 's' : ''}).`
        : `Unfortunately, no rooms are available for ${form.adults} adult${form.adults > 1 ? 's' : ''} from ${form.checkIn} to ${form.checkOut}. Try adjusting your dates or group size.`;

    await saveMessages(sessionId, message, responseMessage, requestId);
    log.info({ type: 'availability_result', optionsCount: result.options.length }, 'Availability check completed');

    return jsonResponse({
      type: 'availability_result',
      mode: 'ai',
      message: responseMessage,
      availability: result,
      alternatives,
      requestId,
    }, 200, kb);
  } catch (error) {
    if (error instanceof AvailabilityError) {
      return jsonResponse(
        { type: 'error', mode: 'ai', message: error.message, requestId },
        400,
      );
    }
    throw error;
  }
}

/** Handle Gemini tool calls */
async function handleToolCalls(
  toolCalls: Array<{ name?: string; args?: Record<string, unknown> }>,
  userMessage: string,
  history: Array<{ role: string; content: string }>,
  kb: Awaited<ReturnType<typeof loadKnowledgeBase>>,
  sessionId: string,
  requestId: string,
  log: ReturnType<typeof createRequestLogger>,
) {
  for (const toolCall of toolCalls) {
    log.info({ tool: toolCall.name, args: toolCall.args }, 'Processing tool call');

    if (toolCall.name === 'checkAvailability') {
      const args = toolCall.args as { checkIn?: string; checkOut?: string; adults?: number } | undefined;

      // Check for missing fields
      const missingFields: MissingField[] = [];
      if (!args?.checkIn) missingFields.push('checkIn');
      if (!args?.checkOut) missingFields.push('checkOut');
      if (!args?.adults) missingFields.push('adults');

      if (missingFields.length > 0) {
        const askMessage = `I'd be happy to check room availability for you! Could you please provide the following: ${missingFields.map((f) => (f === 'checkIn' ? 'check-in date' : f === 'checkOut' ? 'check-out date' : 'number of adults')).join(', ')}?`;
        await saveMessages(sessionId, userMessage, askMessage, requestId);
        return jsonResponse({
          type: 'availability_request',
          mode: 'ai',
          message: askMessage,
          missingFields,
          requestId,
        }, 200, kb);
      }

      try {
        const result = await checkAvailability(args!.checkIn!, args!.checkOut!, args!.adults!);
        let alternatives;
        if (result.options.length === 0) {
          alternatives = await suggestAlternatives(args!.checkIn!, args!.checkOut!, args!.adults!);
        }

        const responseMessage =
          result.options.length > 0
            ? `Great news! I found ${result.options.length} room option(s) for ${args!.adults!} adult${args!.adults! > 1 ? 's' : ''} from ${args!.checkIn!} to ${args!.checkOut!}.`
            : `Unfortunately, no rooms are available for ${args!.adults!} adult${args!.adults! > 1 ? 's' : ''} from ${args!.checkIn!} to ${args!.checkOut!}. Try adjusting your dates or group size.`;

        await saveMessages(sessionId, userMessage, responseMessage, requestId);
        return jsonResponse({
          type: 'availability_result',
          mode: 'ai',
          message: responseMessage,
          availability: result,
          alternatives,
          requestId,
        }, 200, kb);
      } catch (error) {
        if (error instanceof AvailabilityError) {
          return jsonResponse(
            { type: 'error', mode: 'ai', message: error.message, requestId },
            400,
          );
        }
        throw error;
      }
    }

    if (toolCall.name === 'findRoomsForGuests') {
      const args = toolCall.args as { adults?: number } | undefined;
      if (!args?.adults) {
        const askMessage = 'How many adults will be staying? I can find the best room options for you.';
        await saveMessages(sessionId, userMessage, askMessage, requestId);
        return jsonResponse({
          type: 'availability_request',
          mode: 'ai',
          message: askMessage,
          missingFields: ['adults'],
          requestId,
        }, 200, kb);
      }

      try {
        const rooms = await findRoomsForGuests(args.adults);
        if (rooms.length === 0) {
          const noRoomsMsg = `I'm sorry, we don't have rooms that can accommodate ${args.adults} adults. Our maximum occupancy is for smaller groups. Please contact us for special arrangements.`;
          await saveMessages(sessionId, userMessage, noRoomsMsg, requestId);
          return jsonResponse({
            type: 'answer',
            mode: 'ai',
            message: noRoomsMsg,
            requestId,
          }, 200, kb);
        }

        // Build a response using Gemini to format the room info naturally
        const roomInfo = rooms
          .map(
            (r) =>
              `${r.name}: ${r.description} ($${r.pricePerNight}/night, up to ${r.maxOccupancy} guests, ${r.bedType} bed)`,
          )
          .join('\n');

        // Use Gemini to generate a natural-language response with the tool results
        try {
          const toolResultContents: Content[] = [
            ...history.map((msg) => ({
              role: (msg.role === 'assistant' ? 'model' : 'user') as 'model' | 'user',
              parts: [{ text: msg.content }],
            })),
            { role: 'user' as const, parts: [{ text: userMessage }] },
            {
              role: 'model' as const,
              parts: [{ functionCall: { name: 'findRoomsForGuests', args: { adults: args.adults } } }],
            },
          ];

          const functionResponseContent: Content = {
            role: 'user' as const,
            parts: [
              {
                functionResponse: {
                  name: 'findRoomsForGuests',
                  response: { rooms: roomInfo },
                },
              },
            ],
          };

          const result = await callGeminiWithToolResult(
            toolResultContents,
            functionResponseContent,
            kb,
            requestId,
          );

          if (result.type === 'answer' && result.answer) {
            await saveMessages(sessionId, userMessage, result.answer, requestId);
            return jsonResponse({
              type: 'answer',
              mode: 'ai',
              message: result.answer,
              sources: result.usedSourceIds as any,
              requestId,
            }, 200, kb);
          }
        } catch {
          // Fall through to simple response
        }

        // Simple fallback response
        const simpleResponse = `Here are the room options for ${args.adults} adult${args.adults > 1 ? 's' : ''}:\n\n${roomInfo}\n\nWould you like to check availability for specific dates?`;
        await saveMessages(sessionId, userMessage, simpleResponse, requestId);
        return jsonResponse({
          type: 'answer',
          mode: 'ai',
          message: simpleResponse,
          sources: rooms.map((r) => r.roomTypeId) as any,
          requestId,
        }, 200, kb);
      } catch (error) {
        if (error instanceof AvailabilityError) {
          return jsonResponse(
            { type: 'error', mode: 'ai', message: error.message, requestId },
            400,
          );
        }
        throw error;
      }
    }
  }

  // Unknown tool call
  log.warn({ toolCalls: toolCalls.map((tc) => tc.name) }, 'Unknown tool call');
  return jsonResponse({
    type: 'fallback',
    mode: 'fallback',
    message: FALLBACK_MESSAGE,
    requestId,
  });
}

/** Degraded mode — when Gemini is unavailable, try keyword-based FAQ matching */
async function handleDegradedMode(
  message: string,
  kb: Awaited<ReturnType<typeof loadKnowledgeBase>>,
  sessionId: string,
  requestId: string,
) {
  const faqMatch = matchFaqByKeywords(message, kb.faqs);
  if (faqMatch) {
    await saveMessages(sessionId, message, faqMatch.answer, requestId);
    return jsonResponse({
      type: 'answer',
      mode: 'degraded',
      message: faqMatch.answer,
      sources: [faqMatch.sourceId] as any,
      requestId,
    }, 200, kb);
  }

  const errorMsg =
    "I'm experiencing some technical difficulties right now. Please contact us directly at +91 80 1234 5678 or reservations@empirehotels.in for immediate assistance.";
  await saveMessages(sessionId, message, errorMsg, requestId);
  return jsonResponse(
    { type: 'fallback', mode: 'degraded', message: errorMsg, requestId },
    200,
    kb
  );
}

/** Load last N messages from the conversation */
async function loadConversationHistory(sessionId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: { sessionId },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: MAX_HISTORY_MESSAGES,
      },
    },
  });

  if (!conversation) return [];

  return conversation.messages
    .reverse()
    .map((m) => ({ role: m.role, content: m.content }));
}

/** Save user and assistant messages to the conversation */
async function saveMessages(
  sessionId: string,
  userMessage: string,
  assistantMessage: string,
  requestId: string,
) {
  try {
    let conversation = await prisma.conversation.findFirst({
      where: { sessionId },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { sessionId },
      });
    }

    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          role: 'user',
          content: userMessage,
          metadata: { requestId },
        },
        {
          conversationId: conversation.id,
          role: 'assistant',
          content: assistantMessage,
          metadata: { requestId },
        },
      ],
    });
  } catch (error) {
    // Don't fail the request if message saving fails
    createRequestLogger(requestId).error(
      { err: error },
      'Failed to save messages',
    );
  }
}

/** Helper to create consistent JSON responses */
function jsonResponse(data: ChatResponse, status = 200, kb?: Awaited<ReturnType<typeof loadKnowledgeBase>>) {
  // If sources are strings, map them to SourceLabels
  let formattedSources = data.sources;
  if (data.sources && data.sources.length > 0 && typeof data.sources[0] === 'string' && kb) {
    formattedSources = (data.sources as unknown as string[]).map(id => ({
      id,
      label: getSourceLabel(id, kb)
    })) as any;
  }
  
  return NextResponse.json({ ...data, sources: formattedSources }, { status });
}
