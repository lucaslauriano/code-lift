import type { TestCase } from '@code-lift/shared';

const N = 100_000;
const M = 100_000;

/** 100k increases, all on counter 1. Known by construction: [M, 0, 0, …]. */
const allIncreaseFirst = new Array<number>(M).fill(1);
const allIncreaseFirstExpected = (() => {
  const expected = new Array<number>(N).fill(0);
  expected[0] = M;
  return expected;
})();

/**
 * The case that kills the naive solution: increase(1), max counter, repeated 50k times.
 * After each pair every counter equals the number of pairs so far, so the answer is 50000 across
 * the board — known by construction, no second implementation.
 */
const alternating = Array.from({ length: M }, (_, i) => (i % 2 === 0 ? 1 : N + 1));
const alternatingExpected = new Array<number>(N).fill(M / 2);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'the statement example', input: [5, [3, 4, 4, 6, 1, 4, 4]], expected: [3, 2, 2, 4, 2] },
  { name: 'a single increase', input: [3, [1]], expected: [1, 0, 0] },
  { name: 'a single max counter on zeros', input: [3, [4]], expected: [0, 0, 0] },
  { name: 'max counter levels everything', input: [3, [1, 1, 4]], expected: [2, 2, 2] },
  { name: 'N = 1, increases only', input: [1, [1, 1, 1]], expected: [3] },
  { name: 'increase after the level-up', input: [2, [1, 3, 2]], expected: [1, 2] },

  // ---- hidden -------------------------------------------------------------
  { name: 'trailing max counter', input: [3, [1, 2, 4]], expected: [1, 1, 1], hidden: true },
  { name: 'two max counters in a row', input: [3, [1, 4, 4]], expected: [1, 1, 1], hidden: true },
  { name: 'leading max counter', input: [3, [4, 1]], expected: [1, 0, 0], hidden: true },
  { name: 'N = 1 with max counters', input: [1, [2, 1, 2]], expected: [1], hidden: true },
  { name: 'only max counters', input: [4, [5, 5, 5]], expected: [0, 0, 0, 0], hidden: true },
  { name: 'last counter only', input: [4, [4, 4]], expected: [0, 0, 0, 2], hidden: true },
  {
    name: 'counter untouched after the level-up keeps the floor',
    input: [4, [1, 1, 1, 5, 2]],
    expected: [3, 4, 3, 3],
    hidden: true,
  },
  {
    name: 'interleaved increases and level-ups',
    input: [3, [1, 4, 2, 4, 3]],
    expected: [2, 2, 3],
    hidden: true,
  },

  // ---- performance --------------------------------------------------------
  // 100k operations over 100k counters. Writing to all N counters on each max-counter is O(N*M):
  // 10^10 writes for the alternating case.
  {
    name: '100k increases on one counter',
    input: [N, allIncreaseFirst],
    expected: allIncreaseFirstExpected,
    hidden: true,
    perf: true,
  },
  {
    name: '50k max-counter operations interleaved',
    input: [N, alternating],
    expected: alternatingExpected,
    hidden: true,
    perf: true,
  },
];
