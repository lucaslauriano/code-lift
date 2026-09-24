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
    await page.goto('/mock');
    await page.getByRole('button', { name: /Start mock test/ }).click();
    await expect(page.getByRole('heading', { name: 'Mock in progress' })).toBeVisible();

    // Work out which question came up, then solve it with its own reference solution.
    const firstQuestion = page.getByRole('link', { name: /^\d/ }).first();
    const href = (await firstQuestion.getAttribute('href')) ?? '';
    const slug = href.split('/').pop() ?? '';

    const editorialLocked = await page.request.get(`${API_URL}/questions/${slug}/editorial`);
    expect(editorialLocked.status()).toBe(403);

    await page.goto(href);
    await setEditorValue(page, REFERENCE_SOLUTIONS[slug] ?? 'export function solution() {}');
    await page.keyboard.press('ControlOrMeta+Shift+Enter');
    await expect(page.getByText(/\d+ \/ \d+ passed/)).toBeVisible({ timeout: 30_000 });

    await page.goto('/mock');
    await page.getByRole('link', { name: 'Resume session' }).click();
    await page.getByRole('button', { name: 'Finish now' }).click();

    await expect(page.getByRole('heading', { name: 'Mock result' })).toBeVisible();
    const row = page.locator('li', { hasText: slug === '' ? 'x' : /./ });
    await expect(row.first()).toBeVisible();
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
 * Reference solutions for the questions the preset can draw, so the test can actually solve one.
 * Kept here rather than read from packages/content: the point is to exercise the browser path.
 */
const REFERENCE_SOLUTIONS: Record<string, string> = {
  'binary-gap': `export function solution(n: number): number {
    let longest = 0, current = 0, seenOne = false, rest = n;
    while (rest > 0) {
      const bit = rest & 1; rest >>>= 1;
      if (bit === 1) { if (seenOne && current > longest) longest = current; seenOne = true; current = 0; }
      else if (seenOne) current += 1;
    }
    return longest;
  }`,
  'cyclic-rotation': `export function solution(a: number[], k: number): number[] {
    const n = a.length;
    if (n === 0) return [];
    const shift = ((k % n) + n) % n;
    const out = new Array<number>(n);
    for (let i = 0; i < n; i += 1) out[(i + shift) % n] = a[i] as number;
    return out;
  }`,
  distinct: `export function solution(a: number[]): number { return new Set(a).size; }`,
  'odd-occurrences-in-array': `export function solution(a: number[]): number {
    let u = 0; for (const v of a) u ^= v; return u;
  }`,
  brackets: `export function solution(s: string): number {
    const closers = new Map([[')', '('], [']', '['], ['}', '{']]);
    const stack: string[] = [];
    for (const c of s) {
      const want = closers.get(c);
      if (want === undefined) stack.push(c);
      else if (stack.pop() !== want) return 0;
    }
    return stack.length === 0 ? 1 : 0;
  }`,
  'frog-river-one': `export function solution(x: number, a: number[]): number {
    const covered = new Uint8Array(x + 1);
    let remaining = x;
    for (let t = 0; t < a.length; t += 1) {
      const p = a[t] as number;
      if (p >= 1 && p <= x && covered[p] === 0) { covered[p] = 1; remaining -= 1; if (remaining === 0) return t; }
    }
    return -1;
  }`,
  'max-counters': `export function solution(n: number, a: number[]): number[] {
    const c = new Array<number>(n).fill(0);
    let floor = 0, peak = 0;
    for (const op of a) {
      if (op === n + 1) { floor = peak; continue; }
      const i = op - 1;
      const next = Math.max(c[i] as number, floor) + 1;
      c[i] = next;
      if (next > peak) peak = next;
    }
    for (let i = 0; i < n; i += 1) if ((c[i] as number) < floor) c[i] = floor;
    return c;
  }`,
  'missing-integer': `export function solution(a: number[]): number {
    const n = a.length;
    const seen = new Uint8Array(n + 2);
    for (const v of a) if (v >= 1 && v <= n) seen[v] = 1;
    for (let k = 1; k <= n + 1; k += 1) if (seen[k] === 0) return k;
    return n + 1;
  }`,
  'passing-cars': `export function solution(a: number[]): number {
    let east = 0, pairs = 0;
    for (const car of a) {
      if (car === 0) east += 1;
      else { pairs += east; if (pairs > 1000000000) return -1; }
    }
    return pairs;
  }`,
  triangle: `export function solution(a: number[]): number {
    if (a.length < 3) return 0;
    const s = [...a].sort((x, y) => x - y);
    for (let i = 0; i + 2 < s.length; i += 1) {
      if ((s[i] as number) > (s[i + 2] as number) - (s[i + 1] as number)) return 1;
    }
    return 0;
  }`,
};
