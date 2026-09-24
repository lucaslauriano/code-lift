/**
 * Creates the single personal account from .env.
 *
 * Idempotent: running it again updates the password rather than failing, which is what you want
 * after changing SEED_USER_PASSWORD.
 */
import { resolve } from 'node:path';
import { config } from 'dotenv';
import * as argon2 from 'argon2';
import { createPrismaClientFromEnv } from '@code-lift/db';

config({ path: resolve(__dirname, '../../../.env'), quiet: true });

async function main(): Promise<void> {
  const email = (process.env['SEED_USER_EMAIL'] ?? 'me@code-lift.local').toLowerCase();
  const password = process.env['SEED_USER_PASSWORD'] ?? 'change-me';
  const name = process.env['SEED_USER_NAME'] ?? 'code-lift';

  if (password === 'change-me') {
    console.warn('! SEED_USER_PASSWORD is still the placeholder. Set a real one in .env.');
  }

  const prisma = createPrismaClientFromEnv();
  try {
    const passwordHash = await argon2.hash(password);
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, passwordHash, name },
      update: { passwordHash, name },
    });
    console.log(`Seeded user ${user.email} (${user.id})`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
