import type { TestCase } from '@code-lift/shared';

const N = 100_000;

/** Every card out of range, so every position has to be flipped: N operations. */
const allOutOfRange = new Array<number>(N).fill(0);

/** Already a permutation of 1..N, so nothing to do. */
const alreadyDone = Array.from({ length: N }, (_, i) => i + 1);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'already complete', input: [[3, 2, 1]], expected: 0 },
  { name: 'one flip', input: [[2, 1, 4]], expected: 1 },
  { name: 'three flips, the MEX moves backwards on the way', input: [[1, 3, 5, 7]], expected: 3 },
  { name: 'a single card, already right', input: [[1]], expected: 0 },
  { name: 'a single card, wrong', input: [[9]], expected: 1 },
  { name: 'a permutation of four', input: [[4, 2, 1, 3]], expected: 0 },

  // ---- hidden -------------------------------------------------------------
  { name: 'all values out of range', input: [[0, 0, 0]], expected: 3, hidden: true },
  { name: 'negatives', input: [[-5, -1, -9]], expected: 3, hidden: true },
  {
    name: 'a flip destroys the only copy of a smaller value',
    input: [[2, 5, 1, 9]],
    expected: 4,
    hidden: true,
  },
  { name: 'duplicates leave a gap', input: [[1, 1, 1]], expected: 2, hidden: true },
  { name: 'the largest value is exactly N', input: [[5, 4, 3, 2, 1]], expected: 0, hidden: true },
  { name: 'values just above the range', input: [[4, 4, 4]], expected: 3, hidden: true },
  { name: 'one gap at the end', input: [[1, 2, 9]], expected: 1, hidden: true },
  { name: 'one gap at the start', input: [[9, 2, 3]], expected: 1, hidden: true },

  // ---- performance --------------------------------------------------------
  // 100k cards. Recomputing the MEX from scratch after each flip is O(N) per operation, and the
  // first case forces all 100k operations — ten billion steps.
  {
    name: '100k cards, every one has to be flipped',
    input: [allOutOfRange],
    expected: N,
    hidden: true,
    perf: true,
  },
  {
    name: '100k cards already correct',
    input: [alreadyDone],
    expected: 0,
    hidden: true,
    perf: true,
  },
];
