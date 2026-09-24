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

const N = 100_000;
const ascending = Array.from({ length: N }, (_, i) => i);
const descending = Array.from({ length: N }, (_, i) => N - 1 - i);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'five nodes', input: [list([1, 2, 3, 4, 5])], expected: list([5, 4, 3, 2, 1]) },
  { name: 'two nodes', input: [list([1, 2])], expected: list([2, 1]) },
  { name: 'an empty list', input: [null], expected: null },
  { name: 'a single node', input: [list([1])], expected: list([1]) },
  { name: 'three nodes', input: [list([1, 2, 3])], expected: list([3, 2, 1]) },
  { name: 'negative values', input: [list([-1, -2, -3])], expected: list([-3, -2, -1]) },

  // ---- hidden -------------------------------------------------------------
  { name: 'repeated values', input: [list([7, 7, 7])], expected: list([7, 7, 7]), hidden: true },
  {
    name: 'a palindrome reverses to itself',
    input: [list([1, 2, 1])],
    expected: list([1, 2, 1]),
    hidden: true,
  },
  { name: 'zeros', input: [list([0, 0])], expected: list([0, 0]), hidden: true },
  { name: 'mixed signs', input: [list([-5, 0, 5])], expected: list([5, 0, -5]), hidden: true },
  { name: 'four nodes', input: [list([1, 2, 3, 4])], expected: list([4, 3, 2, 1]), hidden: true },
  {
    name: 'boundary values',
    input: [list([-5000, 5000])],
    expected: list([5000, -5000]),
    hidden: true,
  },
  { name: 'already descending', input: [list([3, 2, 1])], expected: list([1, 2, 3]), hidden: true },
  {
    name: 'ten nodes',
    input: [list([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])],
    expected: list([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]),
    hidden: true,
  },

  // ---- performance --------------------------------------------------------
  // 100k nodes, which is 100k frames for a recursive solution. These cases only run at all because
  // the harness clones deep structures iteratively.
  {
    name: '100k nodes ascending',
    input: [list(ascending)],
    expected: list(descending),
    hidden: true,
    perf: true,
  },
  {
    name: '100k nodes descending',
    input: [list(descending)],
    expected: list(ascending),
    hidden: true,
    perf: true,
  },
];
