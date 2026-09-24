import type { TestCase } from '@code-lift/shared';

/** What the editor shows and what a Run executes. */
export function publicCases(cases: readonly TestCase[]): TestCase[] {
  return cases.filter((testCase) => testCase.hidden !== true);
}

/** Only ever sent to the browser on Submit. */
export function hiddenCases(cases: readonly TestCase[]): TestCase[] {
  return cases.filter((testCase) => testCase.hidden === true);
}

export interface CaseCounts {
  total: number;
  public: number;
  /** Hidden cases that are not performance cases. */
  hidden: number;
  perf: number;
}

export function caseCounts(cases: readonly TestCase[]): CaseCounts {
  return {
    total: cases.length,
    public: cases.filter((c) => c.hidden !== true).length,
    hidden: cases.filter((c) => c.hidden === true && c.perf !== true).length,
    perf: cases.filter((c) => c.perf === true).length,
  };
}
