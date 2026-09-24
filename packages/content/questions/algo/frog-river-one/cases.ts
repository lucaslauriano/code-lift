import type { TestCase } from '@code-lift/shared';

const N = 100_000;

/** Leaves fall on 1, 2, …, N in order: the span is complete exactly at the last index. */
const inOrder = Array.from({ length: N }, (_, i) => i + 1);

/** Every leaf lands on position 1, so positions 2..N are never covered. */
const allOnPositionOne = new Array<number>(N).fill(1);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'the statement example', input: [5, [1, 3, 1, 4, 2, 3, 5, 4]], expected: 6 },
  { name: 'never crosses', input: [2, [1, 1, 1]], expected: -1 },
  { name: 'single position, covered immediately', input: [1, [1]], expected: 0 },
  { name: 'last leaf completes the span', input: [3, [1, 2, 3]], expected: 2 },
  { name: 'extra leaves after the answer do not matter', input: [2, [2, 1, 1, 1, 1]], expected: 1 },
  { name: 'one position missing forever', input: [3, [1, 1, 3, 3]], expected: -1 },

  // ---- hidden -------------------------------------------------------------
  {
    name: 'covered on the very last index',
    input: [3, [3, 3, 1, 1, 2]],
    expected: 4,
    hidden: true,
  },
  { name: 'reverse order', input: [4, [4, 3, 2, 1]], expected: 3, hidden: true },
  {
    name: 'many duplicates before completion',
    input: [2, [1, 1, 1, 1, 2]],
    expected: 4,
    hidden: true,
  },
  { name: 'X larger than the number of leaves', input: [5, [1, 2, 3]], expected: -1, hidden: true },
  { name: 'single leaf, X greater than 1', input: [2, [1]], expected: -1, hidden: true },
  { name: 'first leaf already completes X = 1', input: [1, [1, 1, 1]], expected: 0, hidden: true },
  { name: 'alternating positions', input: [2, [1, 2, 1, 2]], expected: 1, hidden: true },
  {
    name: 'the gap is in the middle of the range',
    input: [4, [1, 2, 4, 4, 4]],
    expected: -1,
    hidden: true,
  },

  // ---- performance --------------------------------------------------------
  // 100k leaves. Re-scanning "is every position covered?" after each leaf is O(N*X) and stalls.
  {
    name: '100k positions covered in order',
    input: [N, inOrder],
    expected: N - 1,
    hidden: true,
    perf: true,
  },
  {
    name: '100k leaves, never crosses',
    input: [N, allOnPositionOne],
    expected: -1,
    hidden: true,
    perf: true,
  },
];
