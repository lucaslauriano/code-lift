import { test as base, expect, type Page } from '@playwright/test';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3334';

export interface Fixtures {
  /** A page that already carries a session cookie. */
  page: Page;
}

/**
 * Signs in through the API rather than the form.
 *
 * The login form has its own coverage in the API e2e suite; driving it here would add a slow,
 * flaky step to every test, and the credentials would be typed into a live browser for no gain.
 */
export const test = base.extend<Fixtures>({
  page: async ({ browser }, use) => {
    const context = await browser.newContext();

    const response = await context.request.post(`${API_URL}/auth/login`, {
      data: {
        email: process.env['SEED_USER_EMAIL'] ?? 'me@code-lift.local',
        password: process.env['SEED_USER_PASSWORD'] ?? 'change-me',
      },
    });
    if (!response.ok()) {
      throw new Error(
        `Could not sign in (${response.status()}). Is the API running and the user seeded?`,
      );
    }

    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect };

/** Runs in the page: true once the workspace has persisted a draft equal to `value`. */
function appHasCode(value: string): boolean {
  return Object.keys(window.localStorage).some(
    (key) => key.startsWith('codelift:code:') && window.localStorage.getItem(key) === value,
  );
}

/**
 * Replaces the editor contents and waits for the app to actually have them.
 *
 * Typing would fight Monaco's auto-closing brackets and auto-indent, so the model is set directly —
 * the same path a paste takes.
 *
 * The retry is not defensive padding. A Monaco model exists a moment before React has attached its
 * change listener, so a `setValue` that lands in that gap updates the visible editor and nothing
 * else: the page looks right and the run executes the starter. The only reliable signal is the
 * draft the workspace persists, so this sets the value until that appears.
 */
export async function setEditorValue(page: Page, code: string): Promise<void> {
  await page.waitForFunction(
    () =>
      (
        window as unknown as { monaco?: { editor: { getModels(): unknown[] } } }
      ).monaco?.editor.getModels().length,
    undefined,
    { timeout: 30_000 },
  );

  const write = (): Promise<void> =>
    page.evaluate((value) => {
      const monaco = (
        window as unknown as {
          monaco: { editor: { getModels(): { setValue(value: string): void }[] } };
        }
      ).monaco;
      monaco.editor.getModels()[0]?.setValue(value);
    }, code);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    await write();
    try {
      await page.waitForFunction(appHasCode, code, { timeout: 2_000 });
      return;
    } catch {
      // The listener was not attached yet. Set it again.
    }
  }

  throw new Error('The workspace never picked up the code set in the editor.');
}

export const FROG_RIVER_SOLUTION = `export function solution(x: number, a: number[]): number {
  const covered = new Uint8Array(x + 1);
  let remaining = x;
  for (let time = 0; time < a.length; time += 1) {
    const position = a[time] as number;
    if (position >= 1 && position <= x && covered[position] === 0) {
      covered[position] = 1;
      remaining -= 1;
      if (remaining === 0) return time;
    }
  }
  return -1;
}`;

/** Correct but quadratic: it rescans the whole span after every leaf. */
export const FROG_RIVER_SLOW_SOLUTION = `export function solution(x: number, a: number[]): number {
  const seen = new Set<number>();
  for (let time = 0; time < a.length; time += 1) {
    seen.add(a[time] as number);
    let complete = true;
    for (let position = 1; position <= x; position += 1) {
      if (!seen.has(position)) { complete = false; break; }
    }
    if (complete) return time;
  }
  return -1;
}`;
