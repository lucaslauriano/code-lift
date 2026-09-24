import type { TestCase } from '@code-lift/shared';

interface ListNode {
  val: number;
  next: ListNode | null;
}

function list(values: readonly number[]): ListNode | null {
  let head: ListNode | null = null;
  for (let i = values.length - 1; i >= 0; i -= 1) head = { val: values[i] as number, next: head };
  return head;
}

const HALF = 50_000;

/** Two interleaving runs: evens and odds, merging back into 0..2*HALF-1. */
const evens = Array.from({ length: HALF }, (_, i) => i * 2);
const odds = Array.from({ length: HALF }, (_, i) => i * 2 + 1);
const interleaved = Array.from({ length: HALF * 2 }, (_, i) => i);

/** Two disjoint runs: everything in the first list precedes everything in the second. */
const lower = Array.from({ length: HALF }, (_, i) => i);
const upper = Array.from({ length: HALF }, (_, i) => HALF + i);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  {
    name: 'the worked example',
    input: [list([1, 2, 4]), list([1, 3, 4])],
    expected: list([1, 1, 2, 3, 4, 4]),
  },
  { name: 'both empty', input: [null, null], expected: null },
  { name: 'one empty', input: [null, list([0])], expected: list([0]) },
  { name: 'the other empty', input: [list([0]), null], expected: list([0]) },
  { name: 'one node each', input: [list([1]), list([2])], expected: list([1, 2]) },
  {
    name: 'disjoint ranges',
    input: [list([1, 2, 3]), list([4, 5, 6])],
    expected: list([1, 2, 3, 4, 5, 6]),
  },

  // ---- hidden -------------------------------------------------------------
  {
    name: 'the second list comes first',
    input: [list([4, 5]), list([1, 2])],
    expected: list([1, 2, 4, 5]),
    hidden: true,
  },
  {
    name: 'fully interleaved',
    input: [list([1, 3, 5]), list([2, 4, 6])],
    expected: list([1, 2, 3, 4, 5, 6]),
    hidden: true,
  },
  {
    name: 'all values equal',
    input: [list([2, 2]), list([2, 2])],
    expected: list([2, 2, 2, 2]),
    hidden: true,
  },
  {
    name: 'one list much longer',
    input: [list([1]), list([2, 3, 4, 5, 6])],
    expected: list([1, 2, 3, 4, 5, 6]),
    hidden: true,
  },
  {
    name: 'negative values',
    input: [list([-3, -1]), list([-2, 0])],
    expected: list([-3, -2, -1, 0]),
    hidden: true,
  },
  {
    name: 'duplicates across both lists',
    input: [list([1, 1, 3]), list([1, 2])],
    expected: list([1, 1, 1, 2, 3]),
    hidden: true,
  },
  {
    name: 'boundary values',
    input: [list([-100]), list([100])],
    expected: list([-100, 100]),
    hidden: true,
  },
  {
    name: 'a single shared value',
    input: [list([5]), list([5])],
    expected: list([5, 5]),
    hidden: true,
  },

  // ---- performance --------------------------------------------------------
  // 100k nodes across the two lists. A solution that collects both into an array and sorts is
  // O(N log N) and allocates; one that appends by walking to the tail each time is O(N^2).
  {
    name: '100k nodes, fully interleaved',
    input: [list(evens), list(odds)],
    expected: list(interleaved),
    hidden: true,
    perf: true,
  },
  {
    name: '100k nodes, disjoint ranges',
    input: [list(lower), list(upper)],
    expected: list(interleaved),
    hidden: true,
    perf: true,
  },
];
