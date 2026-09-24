import type { TestCase } from '@code-lift/shared';

const N = 100_000;

/** 0..N with one value removed — the answer is known by construction. */
function withoutValue(missing: number): number[] {
  const values: number[] = [];
  for (let value = 0; value <= N; value += 1) {
    if (value !== missing) values.push(value);
  }
  return values;
}

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'missing in the middle', input: [[3, 0, 1]], expected: 2 },
  { name: 'missing the largest', input: [[0, 1]], expected: 2 },
  { name: 'nine values', input: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expected: 8 },
  { name: 'a single element, missing 1', input: [[0]], expected: 1 },
  { name: 'a single element, missing 0', input: [[1]], expected: 0 },
  { name: 'missing zero', input: [[1, 2, 3]], expected: 0 },

  // ---- hidden -------------------------------------------------------------
  { name: 'already in order, missing the end', input: [[0, 1, 2, 3]], expected: 4, hidden: true },
  { name: 'reverse order', input: [[4, 3, 2, 1]], expected: 0, hidden: true },
  { name: 'missing the second value', input: [[0, 2, 3, 4]], expected: 1, hidden: true },
  { name: 'missing the second largest', input: [[0, 1, 2, 4]], expected: 3, hidden: true },
  { name: 'two elements, missing the middle', input: [[0, 2]], expected: 1, hidden: true },
  { name: 'shuffled', input: [[5, 2, 0, 4, 1, 6]], expected: 3, hidden: true },
  {
    name: 'ten values, missing the middle',
    input: [[0, 1, 2, 3, 4, 6, 7, 8, 9, 10]],
    expected: 5,
    hidden: true,
  },
  { name: 'three values, missing the end', input: [[2, 0, 1]], expected: 3, hidden: true },

  // ---- performance --------------------------------------------------------
  // 100k elements. Note that the sum of 0..100000 is about 5x10^9 — past a signed 32-bit integer,
  // which is exactly why the reference solution uses XOR instead.
  {
    name: '100k values, missing zero',
    input: [withoutValue(0)],
    expected: 0,
    hidden: true,
    perf: true,
  },
  {
    name: '100k values, missing the largest',
    input: [withoutValue(N)],
    expected: N,
    hidden: true,
    perf: true,
  },
];
