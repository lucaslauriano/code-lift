import type { TestCase } from '@code-lift/shared';

const N = 100_000;

/**
 * Every factory emits the same amount, so the total has a closed form:
 * position i pays ceil(value * (N - 1 - i) / 2), summed over i.
 */
function uniform(value: number, length: number): { input: number[]; expected: number } {
  let expected = 0;
  for (let i = 0; i < length; i += 1) expected += Math.ceil((value * (length - 1 - i)) / 2);
  return { input: new Array<number>(length).fill(value), expected };
}

const uniformOnes = uniform(1, N);
const uniformLarge = uniform(1_000_000, 1_000);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'the worked example', input: [[5, 6, 3, 4]], expected: 13 },
  { name: 'a single factory has nothing downstream', input: [[10]], expected: 0 },
  { name: 'two factories', input: [[10, 10]], expected: 5 },
  { name: 'all zeros', input: [[0, 0, 0]], expected: 0 },
  { name: 'rounding up matters', input: [[1, 1, 1]], expected: 2 },
  { name: 'three factories', input: [[2, 4, 6]], expected: 8 },

  // ---- hidden -------------------------------------------------------------
  { name: 'the last factory is the only emitter', input: [[0, 0, 7]], expected: 8, hidden: true },
  { name: 'the first factory is the only emitter', input: [[7, 0, 0]], expected: 0, hidden: true },
  { name: 'an odd downstream total rounds up', input: [[0, 3]], expected: 2, hidden: true },
  { name: 'an even downstream total does not', input: [[0, 4]], expected: 2, hidden: true },
  { name: 'four equal factories', input: [[2, 2, 2, 2]], expected: 6, hidden: true },
  { name: 'descending emissions', input: [[9, 5, 1]], expected: 4, hidden: true },
  { name: 'a zero in the middle', input: [[4, 0, 4]], expected: 4, hidden: true },
  {
    name: 'values near the upper bound',
    input: [[1000000000, 1000000000, 1000000000]],
    expected: 1500000000,
    hidden: true,
  },

  // ---- performance --------------------------------------------------------
  // 100k factories. Recomputing the downstream sum inside the loop is O(N^2): five billion adds.
  {
    name: '100k factories, one unit each',
    input: [uniformOnes.input],
    expected: uniformOnes.expected,
    hidden: true,
    perf: true,
  },
  {
    name: '1k factories emitting a million each',
    input: [uniformLarge.input],
    expected: uniformLarge.expected,
    hidden: true,
    perf: true,
  },
];
