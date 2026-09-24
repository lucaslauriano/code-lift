import type { TestCase } from '@code-lift/shared';

const HALF = 50_000;

/** 50k opens then 50k closes: properly nested, and the deepest possible stack. */
const deeplyNested = '('.repeat(HALF) + ')'.repeat(HALF);

/** 100k openers and nothing else: the stack never unwinds. */
const neverClosed = '('.repeat(2 * HALF);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'the statement example', input: ['{[()()]}'], expected: 1 },
  { name: 'crossed brackets', input: ['([)()]'], expected: 0 },
  { name: 'empty string is properly nested', input: [''], expected: 1 },
  { name: 'unclosed openers', input: ['(('], expected: 0 },
  { name: 'simple pair', input: ['()'], expected: 1 },
  { name: 'two sequential groups', input: ['()[]{}'], expected: 1 },

  // ---- hidden -------------------------------------------------------------
  { name: 'a lone closer', input: [')'], expected: 0, hidden: true },
  { name: 'closer before opener', input: [')('], expected: 0, hidden: true },
  { name: 'mismatched kinds', input: ['(]'], expected: 0, hidden: true },
  { name: 'nested three deep', input: ['{[()]}'], expected: 1, hidden: true },
  { name: 'one extra closer at the end', input: ['())'], expected: 0, hidden: true },
  { name: 'one extra opener at the start', input: ['(()'], expected: 0, hidden: true },
  { name: 'interleaved groups, properly nested', input: ['[{}()]'], expected: 1, hidden: true },
  { name: 'wrong closer deep inside', input: ['{[(])}'], expected: 0, hidden: true },

  // ---- performance --------------------------------------------------------
  // 100k characters. A solution that repeatedly does `s.replace('()', '')` until nothing changes is
  // O(N^2) on the deeply nested case and will not finish.
  {
    name: '100k characters, 50k deep',
    input: [deeplyNested],
    expected: 1,
    hidden: true,
    perf: true,
  },
  {
    name: '100k openers, never closed',
    input: [neverClosed],
    expected: 0,
    hidden: true,
    perf: true,
  },
];
