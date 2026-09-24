import type { TestCase } from '@code-lift/shared';

const N = 100_000;

/** [1 .. N] — every slot filled, so the answer is N + 1. */
const complete = Array.from({ length: N }, (_, i) => i + 1);

/** 100k copies of -1: nothing positive at all, so the answer is 1. */
const allNegative = new Array<number>(N).fill(-1);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'the statement example', input: [[1, 3, 6, 4, 1, 2]], expected: 5 },
  { name: 'a contiguous run', input: [[1, 2, 3]], expected: 4 },
  { name: 'only negatives', input: [[-1, -3]], expected: 1 },
  { name: 'single element', input: [[1]], expected: 2 },
  { name: 'zero is not a positive integer', input: [[0]], expected: 1 },
  { name: 'gap at the front', input: [[2, 3, 4]], expected: 1 },

  // ---- hidden -------------------------------------------------------------
  { name: 'duplicates do not fill new slots', input: [[1, 1, 1]], expected: 2, hidden: true },
  { name: 'huge value out of range is ignored', input: [[1000000]], expected: 1, hidden: true },
  { name: 'mixed signs with a hole', input: [[-5, 1, 2, 4]], expected: 3, hidden: true },
  { name: 'zeros and negatives mixed', input: [[0, -1, -2, 0]], expected: 1, hidden: true },
  { name: 'unsorted complete run', input: [[3, 1, 2]], expected: 4, hidden: true },
  {
    name: 'value equal to the length, with a hole below',
    input: [[3, 3, 3]],
    expected: 1,
    hidden: true,
  },
  { name: 'range boundaries', input: [[-1000000, 1000000]], expected: 1, hidden: true },
  {
    name: 'hole in the middle of a long run',
    input: [[1, 2, 3, 5, 6, 7]],
    expected: 4,
    hidden: true,
  },

  // ---- performance --------------------------------------------------------
  // 100k elements. Any "does the array contain k?" scan per candidate is O(N^2) and stalls.
  {
    name: '100k values 1..N, answer is N + 1',
    input: [complete],
    expected: N + 1,
    hidden: true,
    perf: true,
  },
  {
    name: '100k negatives, answer is 1',
    input: [allNegative],
    expected: 1,
    hidden: true,
    perf: true,
  },
];
