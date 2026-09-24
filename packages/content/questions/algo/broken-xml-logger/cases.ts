import type { TestCase } from '@code-lift/shared';

const HALF = 50_000;

/** 50k orphan closings then 50k unclosed openings: every single tag needs a partner. */
const worstCase = '</a>'.repeat(HALF) + '<a>'.repeat(HALF);

/** 100k perfectly balanced pairs. */
const balanced = '<a></a>'.repeat(HALF);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'two orphan closings', input: ['<app></app></app></app>'], expected: 2 },
  { name: 'two left open', input: ['<app></app><app><app>'], expected: 2 },
  {
    name: 'a missing opening and two left open do not cancel',
    input: ['</app><app><app>'],
    expected: 3,
  },
  { name: 'balanced', input: ['<app></app>'], expected: 0 },
  { name: 'empty log', input: [''], expected: 0 },
  { name: 'two balanced pairs', input: ['<app></app><app></app>'], expected: 0 },

  // ---- hidden -------------------------------------------------------------
  { name: 'only closings', input: ['</app></app></app>'], expected: 3, hidden: true },
  { name: 'only openings', input: ['<app><app><app>'], expected: 3, hidden: true },
  { name: 'a single orphan closing', input: ['</app>'], expected: 1, hidden: true },
  {
    name: 'two names, each balanced on its own',
    input: ['<a><b></a></b>'],
    expected: 0,
    hidden: true,
  },
  {
    name: 'one name balanced, the other has an orphan closing',
    input: ['<a></a><b></b></b>'],
    expected: 1,
    hidden: true,
  },
  { name: 'names are tallied separately', input: ['</a><b>'], expected: 2, hidden: true },
  { name: 'deep nesting of one name', input: ['<a><a><a></a>'], expected: 2, hidden: true },
  { name: 'long names', input: ['</transaction><payment>'], expected: 2, hidden: true },

  // ---- performance --------------------------------------------------------
  // 400k-700k characters. Re-scanning the string per tag, or rebuilding it with replace, is
  // quadratic and will not finish.
  {
    name: '100k tags, every one needs a partner',
    input: [worstCase],
    expected: 2 * HALF,
    hidden: true,
    perf: true,
  },
  { name: '100k balanced pairs', input: [balanced], expected: 0, hidden: true, perf: true },
];
