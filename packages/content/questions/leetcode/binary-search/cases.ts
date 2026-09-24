import type { TestCase } from '@code-lift/shared';

const N = 20_001;

/** -10000..10000, every value present exactly once, so index = value + 10000. */
const full = Array.from({ length: N }, (_, i) => i - 10_000);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'found in the middle', input: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
  { name: 'not present', input: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
  { name: 'a single element that matches', input: [[5], 5], expected: 0 },
  { name: 'a single element that does not', input: [[5], 2], expected: -1 },
  { name: 'the first element', input: [[1, 2, 3, 4], 1], expected: 0 },
  { name: 'the last element', input: [[1, 2, 3, 4], 4], expected: 3 },

  // ---- hidden -------------------------------------------------------------
  // The first two are what a `low < high` loop gets wrong: a window of one is never examined.
  { name: 'two elements, the first', input: [[1, 2], 1], expected: 0, hidden: true },
  { name: 'two elements, the second', input: [[1, 2], 2], expected: 1, hidden: true },
  { name: 'below everything', input: [[1, 2, 3], 0], expected: -1, hidden: true },
  { name: 'above everything', input: [[1, 2, 3], 4], expected: -1, hidden: true },
  { name: 'between two values', input: [[1, 3, 5], 4], expected: -1, hidden: true },
  { name: 'negative values', input: [[-5, -3, -1], -3], expected: 1, hidden: true },
  { name: 'the target is zero', input: [[-1, 0, 1], 0], expected: 1, hidden: true },
  // An even-length array, where the midpoint rounds down and the target sits just past it.
  {
    name: 'even length, target just right of the midpoint',
    input: [[1, 2, 3, 4, 5, 6], 4],
    expected: 3,
    hidden: true,
  },
  {
    name: 'the whole allowed range, first index',
    input: [full, -10_000],
    expected: 0,
    hidden: true,
  },
  {
    name: 'the whole allowed range, last index',
    input: [full, 10_000],
    expected: N - 1,
    hidden: true,
  },
];
