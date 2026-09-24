import {
  expect,
  setEditorValue,
  test,
  FROG_RIVER_SLOW_SOLUTION,
  FROG_RIVER_SOLUTION,
} from './fixtures';

const SUBMIT = 'ControlOrMeta+Shift+Enter';
const RUN = 'ControlOrMeta+Enter';

test.describe('the question list', () => {
  test('filters by topic and opens a workspace', async ({ page }) => {
    await page.goto('/questions');

    await expect(page.getByRole('link', { name: /Frog River One/ })).toBeVisible();

    await page.getByRole('button', { name: 'arrays', pressed: false }).click();
    await expect(page.getByRole('link', { name: /Binary Gap/ })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Frog River One/ })).toBeVisible();

    await page.getByRole('link', { name: /Frog River One/ }).click();
    await expect(page.getByRole('heading', { name: 'Frog River One' })).toBeVisible();
  });

  test('searches without losing the filter panel', async ({ page }) => {
    await page.goto('/questions');
    await page.getByRole('searchbox', { name: 'Search questions' }).fill('brackets');
    await expect(page.getByRole('link', { name: /Brackets/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Frog River One/ })).toHaveCount(0);
  });
});

test.describe('the workspace', () => {
  test('runs the public cases, then submits against every case and marks the question solved', async ({
    page,
  }) => {
    await page.goto('/questions/frog-river-one');

    // The statement is server-rendered MDX, so it is there before the editor finishes loading.
    await expect(page.getByText('A small frog wants to get to the other side')).toBeVisible();

    await setEditorValue(page, FROG_RIVER_SOLUTION);

    await page.keyboard.press(RUN);
    await expect(page.getByText('6 / 6 passed')).toBeVisible();

    await page.keyboard.press(SUBMIT);
    // 16 cases: 6 public, 8 hidden, 2 performance.
    await expect(page.getByText('16 / 16 passed')).toBeVisible({ timeout: 30_000 });

    await expect(page.getByText('solved', { exact: true })).toBeVisible();

    await page.goto('/questions');
    const card = page.getByRole('link', { name: /Frog River One/ });
    await expect(card.getByText('Solved')).toBeAttached();
  });

  test('reports a wrong answer with both values instead of just failing', async ({ page }) => {
    await page.goto('/questions/frog-river-one');
    await setEditorValue(page, 'export function solution(): number { return 42; }');

    await page.keyboard.press(RUN);
    await expect(page.getByText(/[0-5] \/ 6 passed/)).toBeVisible();
    await expect(page.getByText('received', { exact: false }).first()).toBeVisible();
  });

  test('surfaces a compile error rather than a blank panel', async ({ page }) => {
    await page.goto('/questions/frog-river-one');
    await setEditorValue(page, 'export function solution( {');

    await page.keyboard.press(RUN);
    await expect(page.getByText('Could not compile')).toBeVisible();
  });

  test('fails a correct-but-quadratic solution on the performance cases', async ({ page }) => {
    await page.goto('/questions/frog-river-one');
    await setEditorValue(page, FROG_RIVER_SLOW_SOLUTION);

    await page.keyboard.press(RUN);
    // It is genuinely correct, so the public cases all pass.
    await expect(page.getByText('6 / 6 passed')).toBeVisible();

    await page.keyboard.press(SUBMIT);
    await expect(page.getByText('14 / 16 passed')).toBeVisible({ timeout: 45_000 });
    // Either verdict is the performance dimension doing its job: over the per-case budget, or so
    // far over that the whole run was terminated. This solution is O(N*X) and hits the latter.
    await expect(page.getByText(/too slow|quadratic/).first()).toBeVisible();
  });

  test('keeps the draft in localStorage across a reload', async ({ page }) => {
    await page.goto('/questions/distinct');
    await setEditorValue(page, '// my work in progress\nexport function solution() { return 0; }');

    await page.waitForFunction(() =>
      window.localStorage
        .getItem('codelift:code:distinct:typescript')
        ?.includes('work in progress'),
    );

    await page.reload();
    await expect(page.getByText('// my work in progress')).toBeVisible();
  });

  test('captures console output from the solution', async ({ page }) => {
    await page.goto('/questions/distinct');
    await setEditorValue(
      page,
      'export function solution(a: number[]): number { console.log("saw", a.length); return new Set(a).size; }',
    );

    await page.keyboard.press(RUN);
    await expect(page.getByText('6 / 6 passed')).toBeVisible();

    await page.getByRole('tab', { name: /Console/ }).click();
    await expect(page.getByText('saw 6').first()).toBeVisible();
  });

  test('runs a case the user added', async ({ page }) => {
    await page.goto('/questions/distinct');
    await setEditorValue(
      page,
      'export function solution(a: number[]): number { return new Set(a).size; }',
    );

    await page.getByRole('tab', { name: /Test cases/ }).click();
    await page.getByLabel('Arguments (JSON array)').fill('[[9, 9, 9, 1]]');
    await page.getByLabel('Expected').fill('2');
    await page.getByRole('button', { name: 'Add' }).click();

    await page.keyboard.press(RUN);
    await expect(page.getByText('7 / 7 passed')).toBeVisible();
  });
});
