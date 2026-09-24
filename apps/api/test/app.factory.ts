import { resolve } from 'node:path';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { Server } from 'node:http';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import { SESSION_COOKIE } from '../src/config/env';

config({ path: resolve(__dirname, '../../../.env'), quiet: true });

// Every e2e spec talks to the throwaway database created in global-setup.
process.env['DATABASE_URL'] = process.env['TEST_DATABASE_URL'] ?? '';

export interface TestApp {
  app: INestApplication;
  prisma: PrismaService;
  close(): Promise<void>;
}

/**
 * Boots the real AppModule — global guard, real Prisma, real argon2.
 *
 * Nothing is mocked on purpose: the things most likely to break here are the wiring (is the guard
 * actually global? does the cookie round-trip?), and a mock would hide exactly those.
 */
export async function createTestApp(): Promise<TestApp> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

  const app = moduleRef.createNestApplication();
  app.use(cookieParser());
  await app.init();

  const prisma = app.get(PrismaService);

  return {
    app,
    prisma,
    async close(): Promise<void> {
      await app.close();
    },
  };
}

/** Logs in over HTTP and returns the Set-Cookie value, ready to hand to `.set('Cookie', …)`. */
export async function signIn(server: Server, email: string, password: string): Promise<string> {
  const response = await request(server).post('/auth/login').send({ email, password });
  if (response.status !== 200) {
    throw new Error(`sign-in failed with ${response.status}: ${JSON.stringify(response.body)}`);
  }
  const raw = response.headers['set-cookie'];
  const cookie = (Array.isArray(raw) ? raw : []).find((value: string) =>
    value.startsWith(`${SESSION_COOKIE}=`),
  );
  if (!cookie) throw new Error('sign-in returned no session cookie');
  return cookie;
}

export async function createUser(
  prisma: PrismaService,
  email: string,
  password: string,
): Promise<string> {
  const user = await prisma.client.user.upsert({
    where: { email },
    create: { email, passwordHash: await AuthService.hashPassword(password), name: 'Test' },
    update: { passwordHash: await AuthService.hashPassword(password) },
  });
  return user.id;
}
