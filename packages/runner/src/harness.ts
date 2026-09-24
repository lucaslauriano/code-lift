import {
  DEFAULT_PERF_CASE_BUDGET_MS,
  DEFAULT_RUN_TIMEOUT_MS,
  PERF_RUN_TIMEOUT_MS,
  type CaseResult,
  type LogEntry,
  type RunStatus,
  type TestCase,
} from '@code-lift/shared';
import { deepCloneInput } from './clone';
import { captureConsole } from './console-capture';
import { deepEqual } from './deep-equal';
import type { SolutionFn } from './evaluate';
import { serializeError, serializeValue } from './serialize';

export interface RunCasesOptions {
  fn: SolutionFn;
  cases: readonly TestCase[];
  /** Called as soon as each case settles, so a later hang cannot swallow earlier results. */
  onCase?: (result: CaseResult) => void;
  onLog?: (entry: LogEntry) => void;
}

export interface HarnessOutcome {
  status: RunStatus;
  cases: CaseResult[];
  logs: LogEntry[];
  durationMs: number;
}

export async function runCases(options: RunCasesOptions): Promise<HarnessOutcome> {
  const { fn, cases, onCase, onLog } = options;
  const logs: LogEntry[] = [];
  const results: CaseResult[] = [];
  const capture = captureConsole((entry) => {
    logs.push(entry);
    onLog?.(entry);
  });

  const startedAt = performance.now();
  try {
    for (let index = 0; index < cases.length; index += 1) {
      const testCase = cases[index];
      if (!testCase) continue;
      capture.setCaseIndex(index);
      const result = await runSingleCase(fn, testCase, index);
      results.push(result);
      onCase?.(result);
    }
  } finally {
    capture.setCaseIndex(null);
    capture.restore();
  }

  return {
    status: aggregate(results),
    cases: results,
    logs,
    durationMs: performance.now() - startedAt,
  };
}

async function runSingleCase(
  fn: SolutionFn,
  testCase: TestCase,
  index: number,
): Promise<CaseResult> {
  const name = testCase.name ?? `Case ${index + 1}`;
  const hidden = testCase.hidden === true;
  const perf = testCase.perf === true;

  // Clone before timing: a solution that sorts its argument in place must not corrupt the input
  // for a later case that shares the same literal, and the clone cost is not the solution's.
  let args: unknown[];
  try {
    args = cloneArgs(testCase.input);
  } catch (error) {
    return {
      index,
      name,
      status: 'error',
      hidden,
      perf,
      received: null,
      expected: serializeValue(testCase.expected),
      error: `Test case input could not be cloned: ${serializeError(error)}`,
      durationMs: 0,
    };
  }

  const startedAt = performance.now();
  try {
    const received = await (fn as (...a: unknown[]) => unknown)(...args);
    const durationMs = performance.now() - startedAt;
    const correct = deepEqual(received, testCase.expected);

    // A performance case can be right and still fail. Without this, an O(N^2) solution returns the
    // correct answer on a 100k input in a few seconds, lands inside the whole-run timeout, and
    // scores full marks — which is exactly what the performance dimension exists to prevent.
    const budgetMs = testCase.perfBudgetMs ?? DEFAULT_PERF_CASE_BUDGET_MS;
    const tooSlow = perf && correct && durationMs > budgetMs;

    return {
      index,
      name,
      status: correct && !tooSlow ? 'passed' : 'failed',
      hidden,
      perf,
      received: correct ? null : serializeValue(received),
      expected: correct ? null : serializeValue(testCase.expected),
      error: tooSlow
        ? `Correct, but too slow: ${Math.round(durationMs)}ms against a ${budgetMs}ms budget. ` +
          'Look for a nested loop or a repeated scan.'
        : null,
      durationMs,
    };
  } catch (error) {
    return {
      index,
      name,
      status: 'error',
      hidden,
      perf,
      received: null,
      expected: serializeValue(testCase.expected),
      error: serializeError(error),
      durationMs: performance.now() - startedAt,
    };
  }
}

function cloneArgs(input: readonly unknown[]): unknown[] {
  return input.map(deepCloneInput);
}

function aggregate(results: readonly CaseResult[]): RunStatus {
  if (results.some((result) => result.status === 'timeout')) return 'timeout';
  if (results.some((result) => result.status === 'error')) return 'error';
  if (results.some((result) => result.status === 'failed')) return 'failed';
  return 'passed';
}

/** How long a whole run may take, given the cases it contains. */
export function timeoutForCases(cases: readonly TestCase[]): number {
  const explicit = cases.reduce((total, testCase) => total + (testCase.timeoutMs ?? 0), 0);
  if (explicit > 0) return explicit;
  return cases.some((testCase) => testCase.perf) ? PERF_RUN_TIMEOUT_MS : DEFAULT_RUN_TIMEOUT_MS;
}
