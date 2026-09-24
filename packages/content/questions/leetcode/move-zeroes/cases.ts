import type { TestCase } from '@code-lift/shared';

const N = 100_000;

/** Alternating zero and value: half the array has to shift left. */
const alternating = Array.from({ length: N }, (_, i) => (i % 2 === 0 ? 0 : i));
const alternatingExpected = [
  ...Array.from({ length: N / 2 }, (_, i) => i * 2 + 1),
  ...new Array<number>(N / 2).fill(0),
];

/** Every element zero except the last: the worst case for a swap-per-element solution. */
const zerosThenOne = [...new Array<number>(N - 1).fill(0), 7];
const zerosThenOneExpected = [7, ...new Array<number>(N - 1).fill(0)];

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'the worked example', input: [[0, 1, 0, 3, 12]], expected: [1, 3, 12, 0, 0] },
  { name: 'a single zero', input: [[0]], expected: [0] },
  { name: 'no zeros at all', input: [[1, 2, 3]], expected: [1, 2, 3] },
  { name: 'all zeros', input: [[0, 0, 0]], expected: [0, 0, 0] },
  { name: 'zeros already at the end', input: [[1, 2, 0, 0]], expected: [1, 2, 0, 0] },
  { name: 'zeros at the front', input: [[0, 0, 1, 2]], expected: [1, 2, 0, 0] },

  // ---- hidden -------------------------------------------------------------
  { name: 'a single non-zero', input: [[5]], expected: [5], hidden: true },
  {
    name: 'negatives keep their order',
    input: [[0, -1, 0, -2]],
    expected: [-1, -2, 0, 0],
    hidden: true,
  },
  {
    name: 'order is preserved among duplicates',
    input: [[2, 0, 2, 0, 1]],
    expected: [2, 2, 1, 0, 0],
    hidden: true,
  },
  { name: 'one zero in the middle', input: [[1, 0, 2]], expected: [1, 2, 0], hidden: true },
  { name: 'two elements, zero first', input: [[0, 1]], expected: [1, 0], hidden: true },
  { name: 'two elements, zero last', input: [[1, 0]], expected: [1, 0], hidden: true },
  {
    name: 'boundary values',
    input: [[0, 1000000000, 0, -1000000000]],
    expected: [1000000000, -1000000000, 0, 0],
    hidden: true,
  },
  {
    name: 'a long run of zeros in the middle',
    input: [[1, 0, 0, 0, 0, 2]],
    expected: [1, 2, 0, 0, 0, 0],
    hidden: true,
  },

  // ---- performance --------------------------------------------------------
  // 100k elements. Removing zeros with splice inside a loop is O(N^2), because every splice shifts
  // the tail of the array.
  {
    name: '100k elements, every other one zero',
    input: [alternating],
    expected: alternatingExpected,
    hidden: true,
    perf: true,
  },
  {
    name: '100k zeros with one value at the end',
    input: [zerosThenOne],
    expected: zerosThenOneExpected,
    hidden: true,
    perf: true,
  },
];
