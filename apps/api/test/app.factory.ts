import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { Server } from 'node:http';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import { SESSION_COOKIE } from '../src/config/env';

// The environment is prepared in test/test-env.ts, which Vitest loads as a setup file — early
// enough to beat AppModule's eager config read. Doing it here would be too late.

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

  // Refuse to run against anything but the throwaway database.
  //
  // This is not paranoia: the suite silently used the development database for its whole first
  // life, because @nestjs/config let the .env file override the DATABASE_URL set here. Everything
  // passed — it was just mutating the wrong rows. A test setup that lies is worse than none.
  const connected = app.get(ConfigService).get<string>('DATABASE_URL');
  if (connected !== process.env['TEST_DATABASE_URL']) {
    throw new Error(
      `The test app connected to ${connected ?? '(unset)'}, not TEST_DATABASE_URL. Refusing to run.`,
    );
  }

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
