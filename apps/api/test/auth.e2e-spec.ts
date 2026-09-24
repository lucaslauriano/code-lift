import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Server } from 'node:http';
import { SESSION_COOKIE } from '../src/config/env';
import { createTestApp, createUser, type TestApp } from './app.factory';

const EMAIL = 'auth-e2e@code-lift.local';
const PASSWORD = 'correct-horse-battery';

let context: TestApp;
let server: Server;

beforeAll(async () => {
  context = await createTestApp();
  server = context.app.getHttpServer() as Server;
  await createUser(context.prisma, EMAIL, PASSWORD);
});

afterAll(async () => {
  await context.close();
});

/** Pulls the session cookie out of a Set-Cookie header. */
function sessionCookie(headers: Record<string, unknown>): string | undefined {
  const raw = headers['set-cookie'];
  const list = Array.isArray(raw) ? (raw as string[]) : [];
  return list.find((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`));
}

describe('POST /auth/login', () => {
  it('returns the user and sets an httpOnly session cookie', async () => {
    const response = await request(server)
      .post('/auth/login')
      .send({ email: EMAIL, password: PASSWORD })
      .expect(200);

    expect(response.body).toMatchObject({ email: EMAIL, name: 'Test' });
    expect(response.body).not.toHaveProperty('passwordHash');

    const cookie = sessionCookie(response.headers);
    expect(cookie).toBeDefined();
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
  });

  it('rejects a wrong password', async () => {
    await request(server)
      .post('/auth/login')
      .send({ email: EMAIL, password: 'not-the-password' })
      .expect(401);
  });

  it('gives the same answer for an unknown email, so accounts cannot be enumerated', async () => {
    const unknown = await request(server)
      .post('/auth/login')
      .send({ email: 'nobody@code-lift.local', password: PASSWORD })
      .expect(401);

    const wrongPassword = await request(server)
      .post('/auth/login')
      .send({ email: EMAIL, password: 'not-the-password' })
      .expect(401);

    expect(unknown.body.message).toBe(wrongPassword.body.message);
  });

  it('rejects a malformed body with the zod messages', async () => {
    const response = await request(server)
      .post('/auth/login')
      .send({ email: 'not-an-email', password: 'short' })
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([
        expect.stringContaining('email'),
        expect.stringContaining('password'),
      ]),
    );
  });
});

describe('GET /auth/me', () => {
  it('is rejected without a cookie — the guard is global, not opt-in', async () => {
    await request(server).get('/auth/me').expect(401);
  });

  it('returns the user when the session cookie is present', async () => {
    const login = await request(server)
      .post('/auth/login')
      .send({ email: EMAIL, password: PASSWORD })
      .expect(200);

    const cookie = sessionCookie(login.headers);
    const response = await request(server)
      .get('/auth/me')
      .set('Cookie', cookie ?? '')
      .expect(200);

    expect(response.body.email).toBe(EMAIL);
  });

  it('rejects a forged token', async () => {
    await request(server).get('/auth/me').set('Cookie', `${SESSION_COOKIE}=not.a.jwt`).expect(401);
  });

  it('rejects a valid token whose user no longer exists', async () => {
    const ghostEmail = 'ghost@code-lift.local';
    await createUser(context.prisma, ghostEmail, PASSWORD);

    const login = await request(server)
      .post('/auth/login')
      .send({ email: ghostEmail, password: PASSWORD })
      .expect(200);
    const cookie = sessionCookie(login.headers);

    await context.prisma.client.user.delete({ where: { email: ghostEmail } });

    await request(server)
      .get('/auth/me')
      .set('Cookie', cookie ?? '')
      .expect(401);
  });
});

describe('POST /auth/logout', () => {
  it('clears the cookie', async () => {
    const response = await request(server).post('/auth/logout').expect(204);
    const cookie = sessionCookie(response.headers);
    expect(cookie).toContain(`${SESSION_COOKIE}=;`);
  });
});

describe('GET /health', () => {
  it('is public, so docker compose can probe it without credentials', async () => {
    await request(server).get('/health').expect(200, { status: 'ok' });
  });
});
