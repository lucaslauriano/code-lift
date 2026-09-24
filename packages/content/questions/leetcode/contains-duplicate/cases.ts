import type { TestCase } from '@code-lift/shared';

const N = 100_000;

/** All distinct: the solution has to look at every element before answering. */
const allDistinct = Array.from({ length: N }, (_, i) => i);

/** Distinct except for the very last element, so no early exit helps. */
const duplicateAtTheEnd = [...Array.from({ length: N - 1 }, (_, i) => i), 0];

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'a duplicate at the ends', input: [[1, 2, 3, 1]], expected: true },
  { name: 'all distinct', input: [[1, 2, 3, 4]], expected: false },
  { name: 'several duplicates', input: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true },
  { name: 'a single element', input: [[7]], expected: false },
  { name: 'two equal elements', input: [[2, 2]], expected: true },
  { name: 'two different elements', input: [[2, 3]], expected: false },

  // ---- hidden -------------------------------------------------------------
  { name: 'negatives', input: [[-1, -2, -3, -1]], expected: true, hidden: true },
  { name: 'negatives, all distinct', input: [[-1, -2, -3]], expected: false, hidden: true },
  { name: 'zero repeated', input: [[0, 0]], expected: true, hidden: true },
  {
    name: 'zero and minus zero are the same value',
    input: [[0, -0]],
    expected: true,
    hidden: true,
  },
  {
    name: 'adjacent duplicates in the middle',
    input: [[5, 1, 9, 9, 2]],
    expected: true,
    hidden: true,
  },
  {
    name: 'boundary values, distinct',
    input: [[-1000000000, 1000000000]],
    expected: false,
    hidden: true,
  },
  {
    name: 'boundary values, repeated',
    input: [[1000000000, 0, 1000000000]],
    expected: true,
    hidden: true,
  },
  {
    name: 'sorted and distinct',
    input: [[1, 2, 3, 4, 5, 6, 7, 8, 9]],
    expected: false,
    hidden: true,
  },

  // ---- performance --------------------------------------------------------
  // 100k elements with no early exit available. A nested comparison loop is O(N^2).
  { name: '100k distinct values', input: [allDistinct], expected: false, hidden: true, perf: true },
  {
    name: '100k values, the duplicate is last',
    input: [duplicateAtTheEnd],
    expected: true,
    hidden: true,
    perf: true,
  },
];
