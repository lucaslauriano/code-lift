import type { TestCase } from '@code-lift/shared';

/** K eastbound cars followed by K westbound cars: exactly K * K pairs, known by construction. */
function block(k: number): number[] {
  return [...new Array<number>(k).fill(0), ...new Array<number>(k).fill(1)];
}

/** 31622^2 = 999,950,884 — just under the one-billion cap. */
const UNDER_CAP = 31_622;
/** 50000^2 = 2,500,000,000 — comfortably over it. */
const OVER_CAP = 50_000;

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'the statement example', input: [[0, 1, 0, 1, 1]], expected: 5 },
  { name: 'no westbound cars', input: [[0, 0, 0]], expected: 0 },
  { name: 'no eastbound cars', input: [[1, 1, 1]], expected: 0 },
  { name: 'westbound before eastbound', input: [[1, 0]], expected: 0 },
  { name: 'one pair', input: [[0, 1]], expected: 1 },
  { name: 'single car', input: [[0]], expected: 0 },

  // ---- hidden -------------------------------------------------------------
  { name: 'single westbound car', input: [[1]], expected: 0, hidden: true },
  { name: 'all eastbound then all westbound', input: [[0, 0, 1, 1]], expected: 4, hidden: true },
  { name: 'alternating', input: [[0, 1, 0, 1]], expected: 3, hidden: true },
  {
    name: 'eastbound cars after the last westbound are wasted',
    input: [[1, 0, 0, 0]],
    expected: 0,
    hidden: true,
  },
  { name: 'trailing eastbound cars', input: [[0, 1, 0, 0]], expected: 1, hidden: true },
  { name: 'leading westbound cars', input: [[1, 1, 0, 1]], expected: 1, hidden: true },
  { name: 'two eastbound, one westbound', input: [[0, 0, 1]], expected: 2, hidden: true },
  { name: 'long alternating run', input: [[0, 1, 0, 1, 0, 1]], expected: 6, hidden: true },

  // ---- performance --------------------------------------------------------
  // Counting pairs with a nested loop is O(N^2). These also pin the overflow guard: the second case
  // exceeds one billion pairs and must return -1 rather than a large number.
  {
    name: '63,244 cars, just under the one-billion cap',
    input: [block(UNDER_CAP)],
    expected: UNDER_CAP * UNDER_CAP,
    hidden: true,
    perf: true,
  },
  {
    name: '100,000 cars, 2.5 billion pairs, must return -1',
    input: [block(OVER_CAP)],
    expected: -1,
    hidden: true,
    perf: true,
  },
];
