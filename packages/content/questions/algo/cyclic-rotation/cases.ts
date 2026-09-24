import type { TestCase } from '@code-lift/shared';

const N = 100_000;

/** [0, 1, 2, …, N-1] — rotating this by K has a closed form, so the expected value needs no second implementation. */
const ascending = Array.from({ length: N }, (_, i) => i);

/** Position i holds whatever was K places to its left, wrapped: value (i - K) mod N. */
function rotatedAscending(k: number): number[] {
  const shift = ((k % N) + N) % N;
  return Array.from({ length: N }, (_, i) => (i - shift + N) % N);
}

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'the statement example', input: [[3, 8, 9, 7, 6], 3], expected: [9, 7, 6, 3, 8] },
  { name: 'rotating zeros changes nothing', input: [[0, 0, 0], 1], expected: [0, 0, 0] },
  { name: 'K equals N, full turn', input: [[1, 2, 3, 4], 4], expected: [1, 2, 3, 4] },
  { name: 'empty array', input: [[], 5], expected: [] },
  { name: 'single element', input: [[7], 3], expected: [7] },
  { name: 'K is zero', input: [[1, 2, 3], 0], expected: [1, 2, 3] },

  // ---- hidden -------------------------------------------------------------
  { name: 'one step', input: [[3, 8, 9, 7, 6], 1], expected: [6, 3, 8, 9, 7], hidden: true },
  { name: 'K larger than N', input: [[1, 2, 3, 4, 5], 7], expected: [4, 5, 1, 2, 3], hidden: true },
  { name: 'K is a multiple of N', input: [[1, 2, 3], 9], expected: [1, 2, 3], hidden: true },
  {
    name: 'negative values',
    input: [[-1, -2, -3, -4], 2],
    expected: [-3, -4, -1, -2],
    hidden: true,
  },
  { name: 'two elements', input: [[1, 2], 1], expected: [2, 1], hidden: true },
  { name: 'empty array with K = 0', input: [[], 0], expected: [], hidden: true },
  {
    name: 'duplicates keep their order',
    input: [[1, 1, 2, 1], 2],
    expected: [2, 1, 1, 1],
    hidden: true,
  },
  {
    name: 'K one short of a full turn',
    input: [[1, 2, 3, 4, 5], 4],
    expected: [2, 3, 4, 5, 1],
    hidden: true,
  },

  // ---- performance --------------------------------------------------------
  // 100k elements with a large K. A "rotate one step, K times" loop is O(N*K) and will not finish;
  // an `unshift`-based loop is O(N) per step and will not finish either.
  {
    name: '100k elements, K = 100000',
    input: [ascending, N],
    expected: rotatedAscending(N),
    hidden: true,
    perf: true,
  },
  {
    name: '100k elements, K = 99999',
    input: [ascending, N - 1],
    expected: rotatedAscending(N - 1),
    hidden: true,
    perf: true,
  },
];
