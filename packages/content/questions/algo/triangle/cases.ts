import type { TestCase } from '@code-lift/shared';

const N = 100_000;

/** [1, 2, 3, …, N]: contains (3, 4, 5) and countless others, so the answer is 1. */
const ascending = Array.from({ length: N }, (_, i) => i + 1);

/** 100k zeros: 0 + 0 > 0 is false, so no triplet is triangular. */
const allZeros = new Array<number>(N).fill(0);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'the statement example', input: [[10, 2, 5, 1, 8, 20]], expected: 1 },
  { name: 'no triplet works', input: [[10, 50, 5, 1]], expected: 0 },
  { name: 'equilateral', input: [[1, 1, 1]], expected: 1 },
  { name: 'fewer than three elements', input: [[1, 2]], expected: 0 },
  { name: 'empty array', input: [[]], expected: 0 },
  { name: 'degenerate triangle does not count', input: [[1, 2, 3]], expected: 0 },

  // ---- hidden -------------------------------------------------------------
  { name: 'exactly three, valid', input: [[3, 4, 5]], expected: 1, hidden: true },
  { name: 'all zeros', input: [[0, 0, 0]], expected: 0, hidden: true },
  { name: 'negatives cannot form a triangle', input: [[-3, -2, -1]], expected: 0, hidden: true },
  {
    name: 'negatives mixed with a valid triplet',
    input: [[-5, -1, 4, 5, 6]],
    expected: 1,
    hidden: true,
  },
  {
    name: 'Fibonacci-like, always degenerate',
    input: [[1, 1, 2, 3, 5, 8, 13]],
    expected: 0,
    hidden: true,
  },
  {
    name: '32-bit boundary values, valid triangle',
    input: [[2147483647, 2147483646, 2147483645]],
    expected: 1,
    hidden: true,
  },
  {
    name: 'two huge duplicates, where p + q would overflow a 32-bit int',
    input: [[1, 2147483647, 2147483647, 1]],
    expected: 1,
    hidden: true,
  },
  { name: 'duplicates of one large value', input: [[5, 5, 5, 1]], expected: 1, hidden: true },

  // ---- performance --------------------------------------------------------
  // 100k elements. Checking every triplet is O(N^3) — utterly hopeless — and even the O(N^2) pair
  // variants stall here.
  {
    name: '100k ascending values, a triangle exists',
    input: [ascending],
    expected: 1,
    hidden: true,
    perf: true,
  },
  { name: '100k zeros, no triangle', input: [allZeros], expected: 0, hidden: true, perf: true },
];
