import type { CaseResult, Language, LogEntry, RunResult, TestCase } from '@code-lift/shared';
import { WORKER_SOURCE } from './generated/worker-source';
import { isWorkerEvent } from './protocol';
import { timeoutForCases } from './harness';

export interface RunInWorkerOptions {
  code: string;
  language: Language;
  cases: readonly TestCase[];
  /** Whole-run budget. Defaults to 5s, or 10s when any case is marked `perf`. */
  timeoutMs?: number;
  onCase?: (result: CaseResult) => void;
  onLog?: (entry: LogEntry) => void;
  signal?: AbortSignal;
}

/**
 * Executes a submission in a throwaway Web Worker.
 *
 * A fresh worker per run is the only reliable way to kill code that never returns: `terminate()`
 * stops a `while (true)` that no cooperative mechanism could. It also means zero state leaks
 * between runs — no stale globals, no monkey-patched prototypes.
 *
 * The worker is built from a Blob URL holding a self-contained bundle, so the host app needs no
 * bundler configuration to use it.
 */
let cachedWorkerUrl: string | null = null;

/**
 * The Blob URL is built once and reused. Only the Worker itself has to be new per run — re-parsing
 * the bundle on every Cmd+Enter would be pure waste.
 */
function workerUrl(): string {
  cachedWorkerUrl ??= URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' }));
  return cachedWorkerUrl;
}

export function runInWorker(options: RunInWorkerOptions): Promise<RunResult> {
  const { code, language, cases, onCase, onLog, signal } = options;
  const budget = options.timeoutMs ?? timeoutForCases(cases);

  return new Promise<RunResult>((resolve) => {
    const worker = new Worker(workerUrl());

    const results = new Map<number, CaseResult>();
    const logs: LogEntry[] = [];
    const startedAt = performance.now();
    let settled = false;

    const cleanup = (): void => {
      worker.terminate();
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    };

    const finish = (status: RunResult['status'], compileError: string | null): void => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({
        status,
        cases: collect(cases, results, status === 'timeout'),
        logs,
        durationMs: performance.now() - startedAt,
        compileError,
      });
    };

    const onAbort = (): void => finish('timeout', null);
    const timer = setTimeout(() => finish('timeout', null), budget);
    signal?.addEventListener('abort', onAbort, { once: true });

    worker.onmessage = (event: MessageEvent<unknown>): void => {
      const message = event.data;
      if (!isWorkerEvent(message)) return;

      switch (message.type) {
        case 'case':
          results.set(message.result.index, message.result);
          onCase?.(message.result);
          break;
        case 'log':
          logs.push(message.entry);
          onLog?.(message.entry);
          break;
        case 'compile-error':
          finish('error', message.message);
          break;
        case 'done':
          finish(message.status, null);
          break;
      }
    };

    worker.onerror = (event: ErrorEvent): void => {
      event.preventDefault();
      finish('error', event.message || 'The worker crashed while running your code.');
    };

    worker.postMessage({ type: 'run', code, language, cases: cases as TestCase[] });
  });
}

/**
 * Fills in the cases the worker never reported. When a run times out, everything still missing was
 * either running or queued behind the case that hung — both are a timeout from the user's side.
 */
function collect(
  cases: readonly TestCase[],
  reported: ReadonlyMap<number, CaseResult>,
  timedOut: boolean,
): CaseResult[] {
  return cases.map((testCase, index) => {
    const existing = reported.get(index);
    if (existing) return existing;
    return {
      index,
      name: testCase.name ?? `Case ${index + 1}`,
      status: timedOut ? 'timeout' : 'error',
      hidden: testCase.hidden === true,
      perf: testCase.perf === true,
      received: null,
      expected: null,
      error: timedOut ? 'Timed out — the run was stopped before this case finished.' : 'Never ran.',
      durationMs: 0,
    };
  });
}
