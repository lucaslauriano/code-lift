import type { CaseResult, Language, LogEntry, RunStatus, TestCase } from '@code-lift/shared';

export interface WorkerRunRequest {
  type: 'run';
  code: string;
  language: Language;
  cases: TestCase[];
}

export type WorkerEvent =
  | { type: 'case'; result: CaseResult }
  | { type: 'log'; entry: LogEntry }
  | { type: 'compile-error'; message: string }
  | { type: 'done'; status: RunStatus; durationMs: number };

export function isWorkerEvent(value: unknown): value is WorkerEvent {
  if (typeof value !== 'object' || value === null) return false;
  const type = (value as { type?: unknown }).type;
  return type === 'case' || type === 'log' || type === 'compile-error' || type === 'done';
}
