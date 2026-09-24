import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Server } from 'node:http';
import { createTestApp, createUser, signIn, type TestApp } from './app.factory';

const EMAIL = 'practice-e2e@code-lift.local';
const PASSWORD = 'correct-horse-battery';

/** frog-river-one ships 16 cases, 2 of them performance cases. */
const SLUG = 'frog-river-one';
const TOTAL_CASES = 16;
const PERF_CASES = 2;

let context: TestApp;
let server: Server;
let cookie: string;
let userId: string;

function submission(overrides: Record<string, unknown> = {}) {
  return {
    questionSlug: SLUG,
    language: 'typescript',
    code: 'export function solution() {}',
    status: 'passed',
    passedCases: TOTAL_CASES,
    totalCases: TOTAL_CASES,
    perfPassed: PERF_CASES,
    perfTotal: PERF_CASES,
    durationMs: 42,
    ...overrides,
  };
}

beforeAll(async () => {
  context = await createTestApp();
  server = context.app.getHttpServer() as Server;
  userId = await createUser(context.prisma, EMAIL, PASSWORD);
  cookie = await signIn(server, EMAIL, PASSWORD);
});

beforeEach(async () => {
  // Each block starts from a clean history; these tests assert on counts and streaks.
  await context.prisma.client.submission.deleteMany({ where: { userId } });
  await context.prisma.client.mockSession.deleteMany({ where: { userId } });
  await context.prisma.client.progress.deleteMany({ where: { userId } });
});

afterAll(async () => {
  await context.close();
});

describe('POST /submissions', () => {
  it('marks the question done when every case passed', async () => {
    const { body } = await request(server)
      .post('/submissions')
      .set('Cookie', cookie)
      .send(submission())
      .expect(201);

    expect(body.progressStatus).toBe('done');
    expect(body.submission.questionSlug).toBe(SLUG);
  });

  it('marks in_progress when the submission only covered the public cases', async () => {
    const { body } = await request(server)
      .post('/submissions')
      .set('Cookie', cookie)
      .send(submission({ passedCases: 6, totalCases: 6, perfPassed: 0, perfTotal: 0 }))
      .expect(201);

    expect(body.progressStatus).toBe('in_progress');
  });

  it('marks in_progress when some cases failed', async () => {
    const { body } = await request(server)
      .post('/submissions')
      .set('Cookie', cookie)
      .send(submission({ status: 'failed', passedCases: 14 }))
      .expect(201);

    expect(body.progressStatus).toBe('in_progress');
  });

  it('does not demote a solved question after a later failure', async () => {
    await request(server).post('/submissions').set('Cookie', cookie).send(submission()).expect(201);

    const { body } = await request(server)
      .post('/submissions')
      .set('Cookie', cookie)
      .send(submission({ status: 'failed', passedCases: 3 }))
      .expect(201);

    expect(body.progressStatus).toBe('done');
  });

  it('rejects counts the question cannot produce', async () => {
    await request(server)
      .post('/submissions')
      .set('Cookie', cookie)
      .send(submission({ passedCases: 999, totalCases: 999 }))
      .expect(400);

    await request(server)
      .post('/submissions')
      .set('Cookie', cookie)
      .send(submission({ perfPassed: 9, perfTotal: 9 }))
      .expect(400);
  });

  it('404s for a question that is not in the catalogue', async () => {
    await request(server)
      .post('/submissions')
      .set('Cookie', cookie)
      .send(submission({ questionSlug: 'no-such-question' }))
      .expect(404);
  });
});

describe('PATCH /progress/:slug', () => {
  it('lets a question be marked done by hand', async () => {
    const { body } = await request(server)
      .patch(`/progress/${SLUG}`)
      .set('Cookie', cookie)
      .send({ status: 'done' })
      .expect(200);
    expect(body.status).toBe('done');
  });

  it('lets a question be skipped', async () => {
    const { body } = await request(server)
      .patch(`/progress/${SLUG}`)
      .set('Cookie', cookie)
      .send({ status: 'skipped' })
      .expect(200);
    expect(body.status).toBe('skipped');
  });

  it('rejects a status outside the enum', async () => {
    await request(server)
      .patch(`/progress/${SLUG}`)
      .set('Cookie', cookie)
      .send({ status: 'finished' })
      .expect(400);
  });
});

describe('GET /progress/summary', () => {
  it('counts a solved question and starts a streak', async () => {
    await request(server).post('/submissions').set('Cookie', cookie).send(submission()).expect(201);

    const { body } = await request(server)
      .get('/progress/summary')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.totals.done).toBe(1);
    expect(body.totals.total).toBeGreaterThanOrEqual(10);
    expect(body.streakDays).toBe(1);
    expect(body.activity.at(-1).count).toBe(1);
    expect(body.recentSubmissions).toHaveLength(1);
  });

  it('is all zeros with no history, rather than failing', async () => {
    const { body } = await request(server)
      .get('/progress/summary')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.totals.done).toBe(0);
    expect(body.streakDays).toBe(0);
    expect(body.activity).toEqual([]);
    expect(body.byDifficulty.map((d: { difficulty: string }) => d.difficulty)).toEqual([
      'easy',
      'medium',
      'hard',
    ]);
  });

  it('reports a failure rate per topic', async () => {
    await request(server)
      .post('/submissions')
      .set('Cookie', cookie)
      .send(submission({ status: 'failed', passedCases: 3 }))
      .expect(201);

    const { body } = await request(server)
      .get('/progress/summary')
      .set('Cookie', cookie)
      .expect(200);

    const arrays = body.byTopic.find((t: { topic: string }) => t.topic === 'arrays');
    expect(arrays.failureRate).toBe(1);
  });
});

describe('mock sessions', () => {
  it('starts a 90 minute session with three questions', async () => {
    const { body } = await request(server)
      .post('/mock-sessions')
      .set('Cookie', cookie)
      .send({ preset: 'toptal_codility' })
      .expect(201);

    expect(body.questionSlugs).toHaveLength(3);
    expect(new Set(body.questionSlugs).size).toBe(3);
    const minutes = (Date.parse(body.endsAt) - Date.parse(body.startedAt)) / 60_000;
    expect(Math.round(minutes)).toBe(90);
    expect(body.finishedAt).toBeNull();
  });

  it('refuses a second session while one is running', async () => {
    await request(server)
      .post('/mock-sessions')
      .set('Cookie', cookie)
      .send({ preset: 'toptal_codility' })
      .expect(201);

    await request(server)
      .post('/mock-sessions')
      .set('Cookie', cookie)
      .send({ preset: 'toptal_codility' })
      .expect(400);
  });

  it('locks the editorial of every question in the running session', async () => {
    const { body: session } = await request(server)
      .post('/mock-sessions')
      .set('Cookie', cookie)
      .send({ preset: 'toptal_codility' })
      .expect(201);

    for (const slug of session.questionSlugs as string[]) {
      await request(server).get(`/questions/${slug}/editorial`).set('Cookie', cookie).expect(403);
    }

    await request(server)
      .post(`/mock-sessions/${session.id}/finish`)
      .set('Cookie', cookie)
      .expect(201);

    for (const slug of session.questionSlugs as string[]) {
      await request(server).get(`/questions/${slug}/editorial`).set('Cookie', cookie).expect(200);
    }
  });

  it('scores a perfect question 100 and an unattempted one 0', async () => {
    const { body: session } = await request(server)
      .post('/mock-sessions')
      .set('Cookie', cookie)
      .send({ preset: 'toptal_codility' })
      .expect(201);

    const solved = session.questionSlugs[0] as string;
    const { body: cases } = await request(server)
      .get(`/questions/${solved}/cases`)
      .set('Cookie', cookie)
      .expect(200);
    const total = cases.cases.length;
    const perf = cases.cases.filter((c: { perf?: boolean }) => c.perf).length;

    await request(server)
      .post('/submissions')
      .set('Cookie', cookie)
      .send(
        submission({
          questionSlug: solved,
          passedCases: total,
          totalCases: total,
          perfPassed: perf,
          perfTotal: perf,
          mockSessionId: session.id,
        }),
      )
      .expect(201);

    const { body: finished } = await request(server)
      .post(`/mock-sessions/${session.id}/finish`)
      .set('Cookie', cookie)
      .expect(201);

    const scored = finished.results.find(
      (r: { questionSlug: string }) => r.questionSlug === solved,
    );
    expect(scored.score).toBe(100);
    expect(scored.attempted).toBe(true);

    const untouched = finished.results.filter(
      (r: { questionSlug: string }) => r.questionSlug !== solved,
    );
    expect(untouched.every((r: { score: number }) => r.score === 0)).toBe(true);
    expect(Math.round(finished.score)).toBe(33);
  });

  it('weighs correctness at 70 and performance at 30', async () => {
    const { body: session } = await request(server)
      .post('/mock-sessions')
      .set('Cookie', cookie)
      .send({ preset: 'toptal_codility' })
      .expect(201);

    const slug = session.questionSlugs[0] as string;
    const { body: cases } = await request(server)
      .get(`/questions/${slug}/cases`)
      .set('Cookie', cookie)
      .expect(200);
    const total = cases.cases.length;
    const perf = cases.cases.filter((c: { perf?: boolean }) => c.perf).length;

    // Every correctness case passed, no performance case did: the classic O(N^2) submission.
    await request(server)
      .post('/submissions')
      .set('Cookie', cookie)
      .send(
        submission({
          questionSlug: slug,
          status: 'failed',
          passedCases: total - perf,
          totalCases: total,
          perfPassed: 0,
          perfTotal: perf,
          mockSessionId: session.id,
        }),
      )
      .expect(201);

    const { body: finished } = await request(server)
      .post(`/mock-sessions/${session.id}/finish`)
      .set('Cookie', cookie)
      .expect(201);

    const scored = finished.results.find((r: { questionSlug: string }) => r.questionSlug === slug);
    // (14/16)*0.7 + 0*0.3 = 0.6125
    expect(scored.score).toBe(Math.round(((total - perf) / total) * 0.7 * 100));
  });

  it('is idempotent on finish', async () => {
    const { body: session } = await request(server)
      .post('/mock-sessions')
      .set('Cookie', cookie)
      .send({ preset: 'toptal_codility' })
      .expect(201);

    const first = await request(server)
      .post(`/mock-sessions/${session.id}/finish`)
      .set('Cookie', cookie)
      .expect(201);
    const second = await request(server)
      .post(`/mock-sessions/${session.id}/finish`)
      .set('Cookie', cookie)
      .expect(201);

    expect(second.body.finishedAt).toBe(first.body.finishedAt);
    expect(second.body.score).toBe(first.body.score);
  });

  it('refuses a submission filed against a finished session', async () => {
    const { body: session } = await request(server)
      .post('/mock-sessions')
      .set('Cookie', cookie)
      .send({ preset: 'toptal_codility' })
      .expect(201);

    await request(server)
      .post(`/mock-sessions/${session.id}/finish`)
      .set('Cookie', cookie)
      .expect(201);

    await request(server)
      .post('/submissions')
      .set('Cookie', cookie)
      .send(submission({ questionSlug: session.questionSlugs[0], mockSessionId: session.id }))
      .expect(400);
  });

  it('does not expose another user’s session', async () => {
    const { body: session } = await request(server)
      .post('/mock-sessions')
      .set('Cookie', cookie)
      .send({ preset: 'toptal_codility' })
      .expect(201);

    await createUser(context.prisma, 'intruder@code-lift.local', PASSWORD);
    const otherCookie = await signIn(server, 'intruder@code-lift.local', PASSWORD);

    await request(server)
      .get(`/mock-sessions/${session.id}`)
      .set('Cookie', otherCookie)
      .expect(404);
  });

  it('reports the running session so a reload can resume it', async () => {
    const before = await request(server)
      .get('/mock-sessions/active')
      .set('Cookie', cookie)
      .expect(200);
    expect(before.body.session).toBeNull();

    const { body: session } = await request(server)
      .post('/mock-sessions')
      .set('Cookie', cookie)
      .send({ preset: 'toptal_codility' })
      .expect(201);

    const during = await request(server)
      .get('/mock-sessions/active')
      .set('Cookie', cookie)
      .expect(200);
    expect(during.body.session.id).toBe(session.id);
  });
});
