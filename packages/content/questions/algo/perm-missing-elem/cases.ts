import type { TestCase } from '@code-lift/shared';

const N = 100_000;

/** [1 .. N+1] with one value removed — the answer is known by construction. */
function missing(target: number): number[] {
  const values: number[] = [];
  for (let value = 1; value <= N + 1; value += 1) {
    if (value !== target) values.push(value);
  }
  return values;
}

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'missing in the middle', input: [[2, 3, 1, 5]], expected: 4 },
  { name: 'missing the largest', input: [[1, 2, 3]], expected: 4 },
  { name: 'missing the smallest', input: [[2, 3, 4]], expected: 1 },
  { name: 'empty array', input: [[]], expected: 1 },
  { name: 'single element, missing 1', input: [[2]], expected: 1 },
  { name: 'single element, missing 2', input: [[1]], expected: 2 },

  // ---- hidden -------------------------------------------------------------
  { name: 'two elements, missing the middle', input: [[1, 3]], expected: 2, hidden: true },
  { name: 'unsorted, missing the largest', input: [[3, 1, 2]], expected: 4, hidden: true },
  { name: 'reverse order', input: [[5, 4, 3, 2]], expected: 1, hidden: true },
  { name: 'missing the second value', input: [[1, 3, 4, 5]], expected: 2, hidden: true },
  { name: 'missing the second largest', input: [[1, 2, 3, 5]], expected: 4, hidden: true },
  { name: 'ten elements', input: [[11, 1, 2, 3, 4, 5, 6, 7, 8, 9]], expected: 10, hidden: true },
  { name: 'shuffled, missing the middle', input: [[6, 1, 4, 2, 7, 3]], expected: 5, hidden: true },
  { name: 'two elements, missing the largest', input: [[2, 1]], expected: 3, hidden: true },

  // ---- performance --------------------------------------------------------
  // 100k elements. Note the sum reaches ~5x10^9, well past a signed 32-bit integer — a language
  // with fixed-width ints overflows here, which is the point of these two.
  {
    name: '100k values, missing the first',
    input: [missing(1)],
    expected: 1,
    hidden: true,
    perf: true,
  },
  {
    name: '100k values, missing the last',
    input: [missing(N + 1)],
    expected: N + 1,
    hidden: true,
    perf: true,
  },
];
