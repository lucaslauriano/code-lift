import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Server } from 'node:http';
import { createTestApp, createUser, signIn, type TestApp } from './app.factory';

const EMAIL = 'questions-e2e@code-lift.local';
const PASSWORD = 'correct-horse-battery';

let context: TestApp;
let server: Server;
let cookie: string;

beforeAll(async () => {
  context = await createTestApp();
  server = context.app.getHttpServer() as Server;
  await createUser(context.prisma, EMAIL, PASSWORD);
  cookie = await signIn(server, EMAIL, PASSWORD);
});

afterAll(async () => {
  await context.close();
});

describe('GET /questions', () => {
  it('needs a session', async () => {
    await request(server).get('/questions').expect(401);
  });

  it('returns the synced catalogue with every question defaulting to todo', async () => {
    const { body } = await request(server).get('/questions').set('Cookie', cookie).expect(200);

    expect(body.total).toBeGreaterThanOrEqual(10);
    expect(body.questions).toHaveLength(body.total);
    expect(
      body.questions.every((q: { progressStatus: string }) => q.progressStatus === 'todo'),
    ).toBe(true);
  });

  it('sorts easy before medium', async () => {
    const { body } = await request(server).get('/questions').set('Cookie', cookie).expect(200);
    const order = body.questions.map((q: { difficulty: string }) => q.difficulty);
    const firstMedium = order.indexOf('medium');
    expect(order.slice(0, firstMedium).every((d: string) => d === 'easy')).toBe(true);
  });

  it('filters by topic', async () => {
    const { body } = await request(server)
      .get('/questions?topic=arrays')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.total).toBeGreaterThan(0);
    expect(body.questions.every((q: { topics: string[] }) => q.topics.includes('arrays'))).toBe(
      true,
    );
  });

  it('filters by difficulty', async () => {
    const { body } = await request(server)
      .get('/questions?difficulty=medium')
      .set('Cookie', cookie)
      .expect(200);
    expect(body.questions.every((q: { difficulty: string }) => q.difficulty === 'medium')).toBe(
      true,
    );
  });

  it('searches title and summary', async () => {
    const { body } = await request(server)
      .get('/questions?q=frog')
      .set('Cookie', cookie)
      .expect(200);
    expect(body.questions.map((q: { slug: string }) => q.slug)).toEqual(['frog-river-one']);
  });

  it('rejects a topic outside the enum instead of silently returning nothing', async () => {
    await request(server).get('/questions?topic=not-a-topic').set('Cookie', cookie).expect(400);
  });
});

describe('GET /questions/:slug', () => {
  it('returns the workspace payload without the answers', async () => {
    const { body } = await request(server)
      .get('/questions/frog-river-one')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.meta.title).toBe('Frog River One');
    expect(body.prompt.length).toBeGreaterThan(200);
    expect(body.starter).toContain('export function solution');
    expect(body.publicCases).toHaveLength(6);
    expect(body.hiddenCaseCount).toBe(8);
    expect(body.perfCaseCount).toBe(2);

    // The whole point of splitting these endpoints.
    expect(body).not.toHaveProperty('solution');
    expect(body).not.toHaveProperty('editorial');
    expect(body.publicCases.every((c: { hidden?: boolean }) => c.hidden !== true)).toBe(true);
  });

  it('404s for an unknown slug', async () => {
    await request(server).get('/questions/no-such-question').set('Cookie', cookie).expect(404);
  });
});

describe('GET /questions/:slug/cases', () => {
  it('includes the hidden and performance cases, because Submit runs them in the browser', async () => {
    const { body } = await request(server)
      .get('/questions/frog-river-one/cases')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.cases).toHaveLength(16);
    expect(body.cases.filter((c: { hidden?: boolean }) => c.hidden).length).toBe(10);
    expect(body.cases.filter((c: { perf?: boolean }) => c.perf).length).toBe(2);
  });
});

describe('GET /questions/:slug/editorial', () => {
  it('returns the reference solution when no mock is running', async () => {
    const { body } = await request(server)
      .get('/questions/frog-river-one/editorial')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.solution).toContain('export function solution');
    expect(body.editorial.length).toBeGreaterThan(400);
  });
});
