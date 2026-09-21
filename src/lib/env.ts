import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required. Get one at https://ai.google.dev/'),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  INSIGHTS_PASSWORD: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | undefined;

export function getEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const messages = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`❌ Environment validation failed:\n${messages}`);
  }
  _env = result.data;
  return _env;
}
