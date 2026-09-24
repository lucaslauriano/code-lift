import type { TestCase } from '@code-lift/shared';

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'the worked example', input: [3, 7], expected: 28 },
  { name: 'three by two', input: [3, 2], expected: 3 },
  { name: 'a single cell', input: [1, 1], expected: 1 },
  { name: 'a single row', input: [1, 10], expected: 1 },
  { name: 'a single column', input: [10, 1], expected: 1 },
  { name: 'two by two', input: [2, 2], expected: 2 },

  // ---- hidden -------------------------------------------------------------
  { name: 'the grid is symmetric', input: [7, 3], expected: 28, hidden: true },
  { name: 'three by three', input: [3, 3], expected: 6, hidden: true },
  { name: 'two by three', input: [2, 3], expected: 3, hidden: true },
  { name: 'four by four', input: [4, 4], expected: 20, hidden: true },
  { name: 'ten by ten', input: [10, 10], expected: 48620, hidden: true },
  { name: 'one by one hundred', input: [1, 100], expected: 1, hidden: true },
  { name: 'two by one hundred', input: [2, 100], expected: 100, hidden: true },
  // The largest answer the stated bounds allow — it still fits in a 32-bit signed integer.
  { name: 'the answer near the integer limit', input: [17, 17], expected: 601080390, hidden: true },
];
