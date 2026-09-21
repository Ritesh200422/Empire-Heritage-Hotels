import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  redact: {
    paths: ['*.apiKey', '*.GEMINI_API_KEY', '*.authorization', '*.cookie'],
    censor: '[REDACTED]',
  },
  serializers: {
    err: pino.stdSerializers.err,
  },
});

export function createRequestLogger(requestId: string) {
  return logger.child({ requestId });
}
