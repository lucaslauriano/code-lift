import type { TestCase } from '@code-lift/shared';

const HALF = 50_000;

/** 50k openings then 50k closings: balanced, and the deepest the counter ever goes. */
const balanced = '<a>'.repeat(HALF) + '</a>'.repeat(HALF);

/** 100k openings and nothing else. */
const neverClosed = '<a>'.repeat(2 * HALF);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'one left open', input: ['<app><app></app>'], expected: 1 },
  { name: 'extra closings are ignored', input: ['<app></app></app></app>'], expected: 0 },
  { name: 'nothing closed', input: ['<app><app><app>'], expected: 3 },
  { name: 'a leading closing is ignored', input: ['</app><app><app>'], expected: 2 },
  { name: 'empty log', input: [''], expected: 0 },
  { name: 'perfectly balanced', input: ['<app></app>'], expected: 0 },

  // ---- hidden -------------------------------------------------------------
  { name: 'only closings', input: ['</a></b></c>'], expected: 0, hidden: true },
  { name: 'names do not have to match', input: ['<app></div>'], expected: 0, hidden: true },
  { name: 'nested and complete', input: ['<a><b><c></c></b></a>'], expected: 0, hidden: true },
  { name: 'nested, innermost left open', input: ['<a><b><c></b></a>'], expected: 1, hidden: true },
  { name: 'alternating open and close', input: ['<a></a><a></a><a>'], expected: 1, hidden: true },
  {
    name: 'closings clamp and do not bank credit',
    input: ['</a></a><a>'],
    expected: 1,
    hidden: true,
  },
  { name: 'a single opening', input: ['<a>'], expected: 1, hidden: true },
  { name: 'long names', input: ['<transaction><payment></payment>'], expected: 1, hidden: true },

  // ---- performance --------------------------------------------------------
  // 300k-400k characters. Anything that slices or concatenates per tag is quadratic.
  { name: '100k tags, balanced', input: [balanced], expected: 0, hidden: true, perf: true },
  {
    name: '100k openings, none closed',
    input: [neverClosed],
    expected: 2 * HALF,
    hidden: true,
    perf: true,
  },
];
