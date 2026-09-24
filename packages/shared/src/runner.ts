import { z } from 'zod';

export const logLevelSchema = z.enum(['log', 'info', 'warn', 'error', 'debug']);
export type LogLevel = z.infer<typeof logLevelSchema>;

export const logEntrySchema = z.object({
  level: logLevelSchema,
  /** Already serialized in the worker — structured clone cannot carry arbitrary objects safely. */
  message: z.string(),
  /** Index of the case that produced the log, or null for logs emitted at module scope. */
  caseIndex: z.number().int().nonnegative().nullable(),
});
export type LogEntry = z.infer<typeof logEntrySchema>;

export const caseStatusSchema = z.enum(['passed', 'failed', 'error', 'timeout']);
export type CaseStatus = z.infer<typeof caseStatusSchema>;

export const caseResultSchema = z.object({
  index: z.number().int().nonnegative(),
  name: z.string(),
  status: caseStatusSchema,
  hidden: z.boolean(),
  perf: z.boolean(),
  /** Pretty-printed; the raw value never crosses the worker boundary. */
  received: z.string().nullable(),
  expected: z.string().nullable(),
  error: z.string().nullable(),
  durationMs: z.number().nonnegative(),
});
export type CaseResult = z.infer<typeof caseResultSchema>;

export const runStatusSchema = z.enum(['passed', 'failed', 'error', 'timeout']);
export type RunStatus = z.infer<typeof runStatusSchema>;

export const runResultSchema = z.object({
  status: runStatusSchema,
  cases: z.array(caseResultSchema),
  logs: z.array(logEntrySchema),
  durationMs: z.number().nonnegative(),
  /** Set when the code failed to compile or the module never exported `solution`. */
  compileError: z.string().nullable(),
});
export type RunResult = z.infer<typeof runResultSchema>;

export const DEFAULT_RUN_TIMEOUT_MS = 5_000;
export const PERF_RUN_TIMEOUT_MS = 10_000;

/**
 * Default wall-clock budget for a single performance case.
 *
 * Calibrated against the seed questions: the optimal solutions finish a 100k case in single-digit
 * milliseconds, while the naive ones take 1.5-4s per case. Two seconds sits three orders of
 * magnitude above the former and well below the latter, so it survives a slow laptop without ever
 * letting a quadratic solution through.
 */
export const DEFAULT_PERF_CASE_BUDGET_MS = 2_000;
