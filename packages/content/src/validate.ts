import { evaluateModule, getSolution, runCode, transpile } from '@code-lift/runner';
import { DEFAULT_PERF_CASE_BUDGET_MS } from '@code-lift/shared';
import { caseCounts, type CaseCounts } from './cases';
import { loadAllQuestions, type LoadedQuestion } from './load';

/** Minimums every question must meet, as agreed in the content spec. */
export const CASE_REQUIREMENTS = { public: 6, hidden: 8, perf: 2 } as const;

/**
 * The same budget a submission is held to. If a reference solution cannot meet it, either the
 * solution is not optimal or the case is mis-sized — both are content bugs.
 */
const PERF_CASE_BUDGET_MS = DEFAULT_PERF_CASE_BUDGET_MS;

export interface QuestionReport {
  slug: string;
  ok: boolean;
  counts: CaseCounts;
  problems: string[];
  durationMs: number;
  slowestPerfCaseMs: number;
}

export async function validateQuestion(question: LoadedQuestion): Promise<QuestionReport> {
  const problems: string[] = [];
  const counts = caseCounts(question.cases);

  if (counts.public < CASE_REQUIREMENTS.public) {
    problems.push(`only ${counts.public} public cases (need ${CASE_REQUIREMENTS.public})`);
  }
  if (counts.hidden < CASE_REQUIREMENTS.hidden) {
    problems.push(`only ${counts.hidden} hidden cases (need ${CASE_REQUIREMENTS.hidden})`);
  }
  if (counts.perf < CASE_REQUIREMENTS.perf) {
    problems.push(`only ${counts.perf} performance cases (need ${CASE_REQUIREMENTS.perf})`);
  }

  if (question.prompt.trim().length < 200) problems.push('prompt.mdx looks empty');
  if (question.editorial.trim().length < 400) problems.push('editorial.mdx looks too thin');

  // The starter is what the user begins from. It does not have to pass, but it must load and
  // expose the entry point — otherwise the first Run reports a confusing compile error.
  try {
    getSolution(evaluateModule(transpile(question.starter, 'typescript')));
  } catch (error) {
    problems.push(`starter.ts does not export a usable solution: ${(error as Error).message}`);
  }

  // The rule that makes the whole content pipeline trustworthy: the reference solution runs
  // through the very same path a submission takes, against every case the question ships.
  const result = await runCode({
    code: question.solution,
    language: 'typescript',
    cases: question.cases,
  });

  if (result.compileError !== null) {
    problems.push(`solution.ts failed to compile: ${result.compileError}`);
  } else if (result.status !== 'passed') {
    for (const failed of result.cases.filter((c) => c.status !== 'passed')) {
      problems.push(
        `case ${failed.index} (${failed.name}) ${failed.status}` +
          (failed.error
            ? `: ${failed.error.split('\n')[0]}`
            : `: expected ${failed.expected}, got ${failed.received}`),
      );
    }
  }

  const perfResults = result.cases.filter((c) => c.perf);
  const slowestPerfCaseMs = perfResults.reduce((slowest, c) => Math.max(slowest, c.durationMs), 0);
  for (const slow of perfResults.filter((c) => c.durationMs > PERF_CASE_BUDGET_MS)) {
    problems.push(
      `performance case ${slow.index} (${slow.name}) took ${Math.round(slow.durationMs)}ms, over the ${PERF_CASE_BUDGET_MS}ms budget`,
    );
  }

  return {
    slug: question.meta.slug,
    ok: problems.length === 0,
    counts,
    problems,
    durationMs: result.durationMs,
    slowestPerfCaseMs,
  };
}

export async function validateAllQuestions(): Promise<QuestionReport[]> {
  const reports: QuestionReport[] = [];
  for (const question of loadAllQuestions()) {
    reports.push(await validateQuestion(question));
  }
  return reports;
}
