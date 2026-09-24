import { z } from 'zod';

/**
 * Every environment variable the API reads, in one schema.
 *
 * Validated once at boot so a missing JWT_SECRET is a startup crash with a clear message, not a
 * 500 on the first login six hours later.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  API_PORT: z.coerce.number().int().positive().default(3333),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('30d'),
  WEB_ORIGIN: z.url().default('http://localhost:3000'),
  /** Off in local development, where the app is served over plain http. */
  COOKIE_SECURE: z
    .string()
    .default('false')
    .transform((value) => value === 'true'),
  SEED_USER_EMAIL: z.email().default('me@code-lift.local'),
  SEED_USER_PASSWORD: z.string().min(8).default('change-me'),
  SEED_USER_NAME: z.string().default('code-lift'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment:\n${issues}\n\nCopy .env.example to .env and fill it in.`);
  }
  return parsed.data;
}

/** The cookie the browser carries. Named once so the API and the web app cannot drift. */
export const SESSION_COOKIE = 'codelift_session';
