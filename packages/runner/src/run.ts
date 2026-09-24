import type { CaseResult, Language, LogEntry, RunResult, TestCase } from '@code-lift/shared';
import { evaluateModule, getSolution } from './evaluate';
import { runCases } from './harness';
import { CompileError, transpile } from './transpile';

export interface RunCodeOptions {
  code: string;
  language: Language;
  cases: readonly TestCase[];
  onCase?: (result: CaseResult) => void;
  onLog?: (entry: LogEntry) => void;
}

/**
 * The whole pipeline in one call: source → JavaScript → module → cases.
 *
 * Isomorphic by design. The Web Worker uses it in the browser and `content:validate` uses it in
 * Node, which is what makes "the reference solution passes its own cases" a real guarantee: the
 * content check runs through exactly the code path a user's submission takes.
 */
export async function runCode(options: RunCodeOptions): Promise<RunResult> {
  const { code, language, cases, onCase, onLog } = options;

  let solution: ReturnType<typeof getSolution>;
  try {
    solution = getSolution(evaluateModule(transpile(code, language)));
  } catch (error) {
    return {
      status: 'error',
      cases: [],
      logs: [],
      durationMs: 0,
      compileError: error instanceof CompileError ? error.message : String(error),
    };
  }

  const outcome = await runCases({ fn: solution, cases, onCase, onLog });
  return {
    status: outcome.status,
    cases: outcome.cases,
    logs: outcome.logs,
    durationMs: outcome.durationMs,
    compileError: null,
  };
}
