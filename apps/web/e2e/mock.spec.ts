import type { Page } from '@playwright/test';
import { expect, setEditorValue, test } from './fixtures';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3334';

/** Only one session may run at a time, so any leftover has to be closed first. */
test.beforeEach(async ({ page }) => {
  const active = await page.request.get(`${API_URL}/mock-sessions/active`);
  const { session } = (await active.json()) as { session: { id: string } | null };
  if (session) await page.request.post(`${API_URL}/mock-sessions/${session.id}/finish`);
});

test.describe('mock sessions', () => {
  test('runs a session end to end: start, solve one, finish, see the score', async ({ page }) => {
    await page.goto('/mock');
    await page.getByRole('button', { name: /Start mock test/ }).click();

    await expect(page.getByRole('heading', { name: 'Mock in progress' })).toBeVisible();
    // 90 minutes, counting down.
    await expect(page.getByText(/^(89|90):\d\d$/)).toBeVisible();

    const questions = page.getByRole('link', { name: /^\d/ });
    await expect(questions).toHaveCount(3);

    await page.getByRole('button', { name: 'Finish now' }).click();

    await expect(page.getByRole('heading', { name: 'Mock result' })).toBeVisible();
    await expect(page.getByText('0/100')).toBeVisible();
    await expect(page.getByText('not attempted').first()).toBeVisible();
  });

  test('withholds the solution and editorial while the session is running', async ({ page }) => {
    await page.goto('/mock');
    await page.getByRole('button', { name: /Start mock test/ }).click();
    await expect(page.getByRole('heading', { name: 'Mock in progress' })).toBeVisible();

    const firstQuestion = page.getByRole('link', { name: /^\d/ }).first();
    const href = await firstQuestion.getAttribute('href');
    await firstQuestion.click();

    await expect(page.getByText('mock in progress', { exact: true })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Description' })).toBeVisible();
    // Not merely hidden: the server never rendered them, so the tabs do not exist.
    await expect(page.getByRole('tab', { name: 'Solution' })).toHaveCount(0);
    await expect(page.getByRole('tab', { name: 'Editorial' })).toHaveCount(0);
    // Marking a question done by hand would be a way around the clock.
    await expect(page.getByRole('button', { name: 'Mark done' })).toHaveCount(0);

    await page.goto('/mock');
    await page.getByRole('link', { name: 'Resume session' }).click();
    await page.getByRole('button', { name: 'Finish now' }).click();
    await expect(page.getByRole('heading', { name: 'Mock result' })).toBeVisible();

    // And back once the clock has stopped.
    await page.goto(href ?? '/questions');
    await expect(page.getByRole('tab', { name: 'Editorial' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Solution' })).toBeVisible();
  });

  test('scores a question solved inside the session', async ({ page }) => {
    // The preset shuffles, so which questions come up is not known in advance. Collect every
    // Codility-track reference solution first — while the editorials are still unlocked — and look
    // up whichever one the draw produces.
    const solutions = await referenceSolutions(page);

    await page.goto('/mock');
    await page.getByRole('button', { name: /Start mock test/ }).click();
    await expect(page.getByRole('heading', { name: 'Mock in progress' })).toBeVisible();

    const firstQuestion = page.getByRole('link', { name: /^\d/ }).first();
    const href = (await firstQuestion.getAttribute('href')) ?? '';
    const slug = href.split('/').pop() ?? '';

    const solution = solutions.get(slug);
    expect(solution, `no reference solution collected for ${slug}`).toBeDefined();

    // The editorial is locked now that the session covers this question.
    const locked = await page.request.get(`${API_URL}/questions/${slug}/editorial`);
    expect(locked.status()).toBe(403);

    await page.goto(href);
    await setEditorValue(page, solution as string);
    await page.keyboard.press('ControlOrMeta+Shift+Enter');
    await expect(page.getByText(/^(\d+) \/ \1 passed$/)).toBeVisible({ timeout: 45_000 });

    await page.goto('/mock');
    await page.getByRole('link', { name: 'Resume session' }).click();
    await page.getByRole('button', { name: 'Finish now' }).click();

    await expect(page.getByRole('heading', { name: 'Mock result' })).toBeVisible();
    // One of three solved perfectly averages to 33.
    await expect(page.getByText('33/100')).toBeVisible();
  });

  test('refuses to start a second session while one is open', async ({ page }) => {
    await page.goto('/mock');
    await page.getByRole('button', { name: /Start mock test/ }).click();
    await expect(page.getByRole('heading', { name: 'Mock in progress' })).toBeVisible();

    await page.goto('/mock');
    await expect(page.getByText('A session is running')).toBeVisible();
    await expect(page.getByRole('button', { name: /Start mock test/ })).toHaveCount(0);
  });
});

test.describe('the dashboard', () => {
  test('shows progress after a question is solved', async ({ page }) => {
    await page.goto('/questions/distinct');
    await setEditorValue(
      page,
      'export function solution(a: number[]): number { return new Set(a).size; }',
    );
    await page.keyboard.press('ControlOrMeta+Shift+Enter');
    await expect(page.getByText('16 / 16 passed')).toBeVisible({ timeout: 30_000 });

    await page.goto('/dashboard');
    await expect(page.getByRole('link', { name: 'distinct' }).first()).toBeVisible();
    // Solving something today means a streak of at least one day.
    await expect(page.getByText(/^[1-9]\d* days? streak$/)).toBeVisible();
  });
});

/**
 * Every Codility-track reference solution, keyed by slug.
 *
 * Read from the API rather than duplicated here, so adding a question to the catalogue never
 * silently makes this test fall back to a stub and assert the wrong score.
 */
async function referenceSolutions(page: Page): Promise<Map<string, string>> {
  const list = await page.request.get(`${API_URL}/questions?track=codility`);
  const { questions } = (await list.json()) as { questions: { slug: string }[] };

  const solutions = new Map<string, string>();
  for (const { slug } of questions) {
    const response = await page.request.get(`${API_URL}/questions/${slug}/editorial`);
    if (!response.ok()) continue;
    const { solution } = (await response.json()) as { solution: string };
    solutions.set(slug, solution);
  }
  return solutions;
}
