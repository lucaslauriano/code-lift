import type { TestCase } from '@code-lift/shared';

const HALF = 50_000;

/** 50k deep, properly nested, then fully closed. The deepest the stack can get. */
const deeplyNested = '<a>'.repeat(HALF) + '</a>'.repeat(HALF);

/** 100k openings, none of them closed. */
const neverClosed = '<a>'.repeat(2 * HALF);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'the closing tag skips an unclosed one', input: ['<app><div></app>'], expected: 1 },
  { name: 'nothing is closed', input: ['<app><app>'], expected: 2 },
  { name: 'nothing is opened', input: ['</app></app>'], expected: 2 },
  { name: 'wrong name, both ends broken', input: ['<app></div>'], expected: 2 },
  { name: 'three deep, the middle one is skipped', input: ['<a><b><c></c></a>'], expected: 1 },
  { name: 'already valid', input: ['<app><div></div></app>'], expected: 0 },

  // ---- hidden -------------------------------------------------------------
  { name: 'empty string', input: [''], expected: 0, hidden: true },
  { name: 'a single opening', input: ['<a>'], expected: 1, hidden: true },
  { name: 'a single closing', input: ['</a>'], expected: 1, hidden: true },
  { name: 'siblings, both valid', input: ['<a></a><b></b>'], expected: 0, hidden: true },
  { name: 'crossed tags', input: ['<a><b></a></b>'], expected: 2, hidden: true },
  {
    name: 'the same name nested and closed once',
    input: ['<a><a></a>'],
    expected: 1,
    hidden: true,
  },
  { name: 'a closing that skips two', input: ['<a><b><c></a>'], expected: 2, hidden: true },
  { name: 'valid then an orphan closing', input: ['<a></a></b>'], expected: 1, hidden: true },

  // ---- performance --------------------------------------------------------
  // 300k-400k characters and a 50k-deep stack. Searching the stack for the matching name on every
  // closing tag is O(N^2); so is rebuilding the string with replace.
  {
    name: '100k tags nested 50k deep, valid',
    input: [deeplyNested],
    expected: 0,
    hidden: true,
    perf: true,
  },
  {
    name: '100k openings, none closed',
    input: [neverClosed],
    expected: 2 * HALF,
    hidden: true,
    perf: true,
  },
];
