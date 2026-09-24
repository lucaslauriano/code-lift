import { describe, expect, it } from 'vitest';
import { DEFAULT_RUN_TIMEOUT_MS, PERF_RUN_TIMEOUT_MS, type TestCase } from '@code-lift/shared';
import { runCases, timeoutForCases } from './harness';

describe('timeoutForCases', () => {
  it('uses the short budget when every case is a normal one', () => {
    expect(timeoutForCases([{ input: [], expected: 1 }])).toBe(DEFAULT_RUN_TIMEOUT_MS);
  });

  it('uses the long budget as soon as one case is a performance case', () => {
    const cases: TestCase[] = [
      { input: [], expected: 1 },
      { input: [], expected: 1, perf: true },
    ];
    expect(timeoutForCases(cases)).toBe(PERF_RUN_TIMEOUT_MS);
  });

  it('sums explicit per-case budgets when they are given', () => {
    const cases: TestCase[] = [
      { input: [], expected: 1, timeoutMs: 1_000 },
      { input: [], expected: 1, timeoutMs: 2_000 },
    ];
    expect(timeoutForCases(cases)).toBe(3_000);
  });
});

describe('runCases', () => {
  it('names unnamed cases by position', async () => {
    const outcome = await runCases({
      fn: (() => 1) as never,
      cases: [{ input: [], expected: 1 }],
    });
    expect(outcome.cases[0]?.name).toBe('Case 1');
  });

  it('reports a duration for every case', async () => {
    const outcome = await runCases({
      fn: (() => 1) as never,
      cases: [{ input: [], expected: 1 }],
    });
    expect(outcome.cases[0]?.durationMs).toBeGreaterThanOrEqual(0);
    expect(outcome.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('is `passed` when there is nothing to run', async () => {
    const outcome = await runCases({ fn: (() => 1) as never, cases: [] });
    expect(outcome.status).toBe('passed');
  });
});

describe('performance budget', () => {
  const slowButCorrect = ((n: number) => {
    const until = performance.now() + 60;
    while (performance.now() < until) {
      /* burn wall-clock the way a quadratic solution would */
    }
    return n;
  }) as never;

  it('fails a performance case that is correct but over budget', async () => {
    const outcome = await runCases({
      fn: slowButCorrect,
      cases: [{ input: [1], expected: 1, perf: true, perfBudgetMs: 10 }],
    });

    expect(outcome.status).toBe('failed');
    expect(outcome.cases[0]?.error).toContain('too slow');
    // The answer was right, so there is nothing to show in the diff columns.
    expect(outcome.cases[0]?.received).toBeNull();
  });

  it('leaves a non-performance case alone no matter how slow it is', async () => {
    const outcome = await runCases({
      fn: slowButCorrect,
      cases: [{ input: [1], expected: 1, perfBudgetMs: 10 }],
    });
    expect(outcome.status).toBe('passed');
  });

  it('passes a performance case that stays inside its budget', async () => {
    const outcome = await runCases({
      fn: ((n: number) => n) as never,
      cases: [{ input: [1], expected: 1, perf: true, perfBudgetMs: 1_000 }],
    });
    expect(outcome.status).toBe('passed');
  });
});
