import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

export * from '@prisma/client';

/**
 * Prisma 7 no longer takes a connection URL from the schema — it needs a driver adapter. Building
 * the client through one place keeps that detail out of every consumer (the API and the content
 * sync script both call this).
 */
export function createPrismaClient(connectionString: string): PrismaClient {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

/** Reads DATABASE_URL and fails loudly rather than connecting to a default that silently works. */
export function createPrismaClientFromEnv(): PrismaClient {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set — copy .env.example to .env.');
  return createPrismaClient(url);
}
