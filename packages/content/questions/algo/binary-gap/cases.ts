import type { TestCase } from '@code-lift/shared';

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: '1041 -> 10000010001', input: [1041], expected: 5 },
  { name: '9 -> 1001', input: [9], expected: 2 },
  { name: '529 -> two gaps, longest is 4', input: [529], expected: 4 },
  { name: '20 -> 10100, trailing zeros ignored', input: [20], expected: 1 },
  { name: '15 -> 1111, no gap', input: [15], expected: 0 },
  { name: '32 -> 100000, trailing zeros are not a gap', input: [32], expected: 0 },

  // ---- hidden -------------------------------------------------------------
  { name: 'smallest input', input: [1], expected: 0, hidden: true },
  { name: 'single gap of zero length', input: [2], expected: 0, hidden: true },
  { name: '5 -> 101', input: [5], expected: 1, hidden: true },
  { name: '6 -> 110', input: [6], expected: 0, hidden: true },
  { name: '328 -> 101001000', input: [328], expected: 2, hidden: true },
  { name: '1162 -> 10010001010', input: [1162], expected: 3, hidden: true },
  { name: '51712, gap in the middle only', input: [51712], expected: 2, hidden: true },
  { name: '561892', input: [561892], expected: 3, hidden: true },

  // ---- performance --------------------------------------------------------
  // The scale here is the magnitude of N, not an array length: the input is a single integer, so
  // the loop can only ever run 31 times. These cases pin the boundary of the allowed range and
  // catch a solution that builds a string per bit or recurses once per zero.
  {
    name: 'largest allowed N, all ones',
    input: [2147483647],
    expected: 0,
    hidden: true,
    perf: true,
  },
  {
    name: '2^30 + 1, the widest possible gap',
    input: [1073741825],
    expected: 29,
    hidden: true,
    perf: true,
  },
];
