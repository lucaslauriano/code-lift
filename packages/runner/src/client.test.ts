import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TestCase } from '@code-lift/shared';
import { runInWorker } from './client';
import type { WorkerEvent, WorkerRunRequest } from './protocol';

/**
 * A stand-in for the browser Worker. Node has no DedicatedWorker, and what we actually want to
 * pin down here is the main-thread contract: partial results survive a terminate, and the run
 * always settles exactly once.
 */
class FakeWorker {
  static latest: FakeWorker | null = null;
  static script: ((worker: FakeWorker, request: WorkerRunRequest) => void) | null = null;

  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: ((event: { message: string; preventDefault(): void }) => void) | null = null;
  terminated = false;

  constructor() {
    FakeWorker.latest = this;
  }

  postMessage(request: WorkerRunRequest): void {
    FakeWorker.script?.(this, request);
  }

  terminate(): void {
    this.terminated = true;
  }

  emit(event: WorkerEvent): void {
    if (this.terminated) throw new Error('the worker was terminated but still emitted');
    this.onmessage?.({ data: event });
  }
}

const cases: TestCase[] = [
  { name: 'first', input: [1], expected: 1 },
  { name: 'second', input: [2], expected: 2 },
];

function passingCase(index: number): WorkerEvent {
  return {
    type: 'case',
    result: {
      index,
      name: cases[index]?.name ?? '',
      status: 'passed',
      hidden: false,
      perf: false,
      received: null,
      expected: null,
      error: null,
      durationMs: 1,
    },
  };
}

beforeEach(() => {
  vi.stubGlobal('Worker', FakeWorker);
  vi.stubGlobal('URL', { ...URL, createObjectURL: () => 'blob:fake', revokeObjectURL: () => {} });
  FakeWorker.latest = null;
  FakeWorker.script = null;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('runInWorker', () => {
  it('collects streamed cases and resolves on done', async () => {
    FakeWorker.script = (worker) => {
      worker.emit(passingCase(0));
      worker.emit({ type: 'log', entry: { level: 'log', message: 'hi', caseIndex: 0 } });
      worker.emit(passingCase(1));
      worker.emit({ type: 'done', status: 'passed', durationMs: 5 });
    };

    const result = await runInWorker({ code: 'x', language: 'typescript', cases });

    expect(result.status).toBe('passed');
    expect(result.cases.map((c) => c.status)).toEqual(['passed', 'passed']);
    expect(result.logs).toHaveLength(1);
    expect(FakeWorker.latest?.terminated).toBe(true);
  });

  it('keeps the cases that finished before a hang, and marks the rest as timed out', async () => {
    FakeWorker.script = (worker) => {
      // Case 0 finishes; case 1 is the `while (true)` that never reports back.
      worker.emit(passingCase(0));
    };

    const result = await runInWorker({
      code: 'x',
      language: 'typescript',
      cases,
      timeoutMs: 20,
    });

    expect(result.status).toBe('timeout');
    expect(result.cases[0]?.status).toBe('passed');
    expect(result.cases[1]?.status).toBe('timeout');
    expect(result.cases[1]?.error).toContain('Timed out');
    expect(FakeWorker.latest?.terminated).toBe(true);
  });

  it('explains a timeout on a performance case in terms of complexity', async () => {
    FakeWorker.script = () => {
      // Never reports back: the classic quadratic solution on a 100k input.
    };

    const result = await runInWorker({
      code: 'x',
      language: 'typescript',
      cases: [{ name: '100k', input: [1], expected: 1, perf: true }],
      timeoutMs: 20,
    });

    expect(result.cases[0]?.status).toBe('timeout');
    expect(result.cases[0]?.error).toContain('quadratic');
  });

  it('reports a compile error without inventing case results', async () => {
    FakeWorker.script = (worker) => {
      worker.emit({ type: 'compile-error', message: 'Unexpected token' });
    };

    const result = await runInWorker({ code: 'x', language: 'typescript', cases });

    expect(result.status).toBe('error');
    expect(result.compileError).toBe('Unexpected token');
    expect(result.cases.every((c) => c.status === 'error')).toBe(true);
  });

  it('settles once even if the worker keeps talking after done', async () => {
    FakeWorker.script = (worker) => {
      worker.emit({ type: 'done', status: 'passed', durationMs: 1 });
    };

    const result = await runInWorker({ code: 'x', language: 'typescript', cases });
    expect(result.status).toBe('passed');
    // A terminated worker that tries to emit again would throw inside `emit`.
    expect(() => FakeWorker.latest?.emit(passingCase(0))).toThrow();
  });

  it('aborts when the caller signals', async () => {
    const controller = new AbortController();
    FakeWorker.script = () => {
      queueMicrotask(() => controller.abort());
    };

    const result = await runInWorker({
      code: 'x',
      language: 'typescript',
      cases,
      signal: controller.signal,
    });

    expect(result.status).toBe('timeout');
    expect(FakeWorker.latest?.terminated).toBe(true);
  });
});
