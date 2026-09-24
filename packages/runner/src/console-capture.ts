/* eslint-disable no-console -- this module exists to take over console; that is the feature. */
import type { LogEntry, LogLevel } from '@code-lift/shared';
import { serializeValue } from './serialize';

const MAX_ENTRIES = 200;
const LEVELS: readonly LogLevel[] = ['log', 'info', 'warn', 'error', 'debug'];

export interface ConsoleCapture {
  /** Which case is currently running; logs are attributed to it. */
  setCaseIndex(index: number | null): void;
  restore(): void;
}

/**
 * Swaps `console.log` & friends for collectors.
 *
 * Arguments are serialized at capture time rather than stored: in the worker they have to survive
 * a structured clone, and a live object could be mutated by the very code we are measuring.
 */
export function captureConsole(onEntry: (entry: LogEntry) => void): ConsoleCapture {
  const original = new Map<LogLevel, (...args: unknown[]) => void>();
  let caseIndex: number | null = null;
  let emitted = 0;

  for (const level of LEVELS) {
    const previous = console[level] as ((...args: unknown[]) => void) | undefined;
    if (!previous) continue;
    original.set(level, previous);
    console[level] = (...args: unknown[]): void => {
      if (emitted < MAX_ENTRIES) {
        emitted += 1;
        onEntry({
          level,
          message: args
            .map((arg) => (typeof arg === 'string' ? arg : serializeValue(arg)))
            .join(' '),
          caseIndex,
        });
        if (emitted === MAX_ENTRIES) {
          onEntry({
            level: 'warn',
            message: `… console output truncated at ${MAX_ENTRIES} entries`,
            caseIndex,
          });
        }
      }
    };
  }

  return {
    setCaseIndex(index: number | null): void {
      caseIndex = index;
    },
    restore(): void {
      for (const [level, previous] of original) {
        console[level] = previous;
      }
    },
  };
}
