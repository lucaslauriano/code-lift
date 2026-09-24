import type { TestCase } from '@code-lift/shared';

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'two steps', input: [2], expected: 2 },
  { name: 'three steps', input: [3], expected: 3 },
  { name: 'one step', input: [1], expected: 1 },
  { name: 'four steps', input: [4], expected: 5 },
  { name: 'five steps', input: [5], expected: 8 },
  { name: 'six steps', input: [6], expected: 13 },

  // ---- hidden -------------------------------------------------------------
  { name: 'seven steps', input: [7], expected: 21, hidden: true },
  { name: 'ten steps', input: [10], expected: 89, hidden: true },
  { name: 'twenty steps', input: [20], expected: 10946, hidden: true },
  { name: 'thirty steps', input: [30], expected: 1346269, hidden: true },
  { name: 'forty steps', input: [40], expected: 165580141, hidden: true },
  // The stated maximum, and the case a naive recursion cannot finish.
  { name: 'the maximum, forty-five steps', input: [45], expected: 1836311903, hidden: true },
  { name: 'forty-four steps', input: [44], expected: 1134903170, hidden: true },
  { name: 'eight steps', input: [8], expected: 34, hidden: true },
];
