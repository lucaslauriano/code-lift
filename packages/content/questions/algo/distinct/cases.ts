import type { TestCase } from '@code-lift/shared';

const N = 100_000;

/** i % 1000 over 100k elements: exactly 1000 distinct values, known by construction. */
const thousandDistinct = Array.from({ length: N }, (_, i) => i % 1000);

/** 100k elements, every one of them different. */
const allDistinct = Array.from({ length: N }, (_, i) => i - 50_000);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'the statement example', input: [[2, 1, 1, 2, 3, 1]], expected: 3 },
  { name: 'empty array', input: [[]], expected: 0 },
  { name: 'all the same', input: [[5, 5, 5]], expected: 1 },
  { name: 'all different', input: [[1, 2, 3, 4]], expected: 4 },
  { name: 'single element', input: [[7]], expected: 1 },
  { name: 'negatives and positives', input: [[-1, 1, -1, 1, 0]], expected: 3 },

  // ---- hidden -------------------------------------------------------------
  { name: 'zero counts as a value', input: [[0]], expected: 1, hidden: true },
  { name: 'zero and minus zero are one value', input: [[0, -0]], expected: 1, hidden: true },
  { name: 'range boundaries', input: [[-1000000, 1000000]], expected: 2, hidden: true },
  {
    name: 'duplicated boundaries',
    input: [[-1000000, -1000000, 1000000]],
    expected: 2,
    hidden: true,
  },
  { name: 'two elements, equal', input: [[3, 3]], expected: 1, hidden: true },
  { name: 'sorted input', input: [[1, 1, 2, 2, 3, 3, 4]], expected: 4, hidden: true },
  { name: 'reverse sorted input', input: [[4, 3, 3, 2, 2, 1, 1]], expected: 4, hidden: true },
  {
    name: 'numeric ordering, not lexicographic',
    input: [[10, 9, 10, 9, 100, 1000]],
    expected: 4,
    hidden: true,
  },

  // ---- performance --------------------------------------------------------
  // 100k elements. A nested "have I seen this before?" scan is O(N^2) and stalls.
  {
    name: '100k elements, 1000 distinct',
    input: [thousandDistinct],
    expected: 1000,
    hidden: true,
    perf: true,
  },
  {
    name: '100k elements, all distinct',
    input: [allDistinct],
    expected: N,
    hidden: true,
    perf: true,
  },
];
