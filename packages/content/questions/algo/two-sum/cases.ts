import type { TestCase } from '@code-lift/shared';

const N = 100_000;

/** [1, 2, …, N] with a target that only the last two elements reach. */
const ascending = Array.from({ length: N }, (_, i) => i + 1);
const ascendingTarget = N + (N - 1);

/** Even numbers 0, 2, …, 2N-2; again only the final pair works. */
const evens = Array.from({ length: N }, (_, i) => i * 2);
const evensTarget = (N - 1) * 2 + (N - 2) * 2;

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'the first two elements', input: [[2, 7, 11, 15], 9], expected: [0, 1] },
  { name: 'the pair is not at the start', input: [[3, 2, 4], 6], expected: [1, 2] },
  { name: 'two equal values', input: [[3, 3], 6], expected: [0, 1] },
  { name: 'negatives', input: [[-1, -2, -3, -4, -5], -8], expected: [2, 4] },
  { name: 'zeros summing to zero', input: [[0, 4, 3, 0], 0], expected: [0, 3] },
  { name: 'the smallest possible input', input: [[1, 2], 3], expected: [0, 1] },

  // ---- hidden -------------------------------------------------------------
  {
    name: 'the pair spans the whole array',
    input: [[5, 1, 1, 1, 6], 11],
    expected: [0, 4],
    hidden: true,
  },
  { name: 'mixed signs', input: [[-3, 4, 3, 90], 0], expected: [0, 2], hidden: true },
  {
    name: 'a value equal to half the target must not pair with itself',
    input: [[4, 1, 2, 4], 8],
    expected: [0, 3],
    hidden: true,
  },
  {
    name: 'large values',
    input: [[1000000000, 500000000, 500000000], 1000000000],
    expected: [1, 2],
    hidden: true,
  },
  { name: 'target is negative', input: [[-10, -7, -3, -1], -4], expected: [2, 3], hidden: true },
  {
    name: 'duplicates that are not the answer',
    input: [[2, 2, 2, 5], 7],
    expected: [0, 3],
    hidden: true,
  },
  {
    name: 'answer at the very end',
    input: [[1, 2, 3, 4, 5, 6], 11],
    expected: [4, 5],
    hidden: true,
  },
  {
    name: 'zero target with a positive and a negative',
    input: [[7, 0, -7], 0],
    expected: [0, 2],
    hidden: true,
  },

  // ---- performance --------------------------------------------------------
  // 100k elements with the answer at the far end, so the whole array is scanned. A nested loop is
  // O(N^2) — five billion comparisons.
  {
    name: '100k ascending, answer is the last pair',
    input: [ascending, ascendingTarget],
    expected: [N - 2, N - 1],
    hidden: true,
    perf: true,
  },
  {
    name: '100k even numbers, answer is the last pair',
    input: [evens, evensTarget],
    expected: [N - 2, N - 1],
    hidden: true,
    perf: true,
  },
];
