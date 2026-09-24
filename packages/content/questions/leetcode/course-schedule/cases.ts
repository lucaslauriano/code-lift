import type { TestCase } from '@code-lift/shared';

const N = 100_000;

/** A single chain 0 → 1 → … → N-1: acyclic, and the deepest possible dependency. */
const chain = Array.from({ length: N - 1 }, (_, i) => [i + 1, i]);

/** The same chain with one edge closing the loop back to the start. */
const chainWithCycle = [...chain, [0, N - 1]];

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'one prerequisite', input: [2, [[1, 0]]], expected: true },
  {
    name: 'two courses requiring each other',
    input: [
      2,
      [
        [1, 0],
        [0, 1],
      ],
    ],
    expected: false,
  },
  { name: 'no prerequisites at all', input: [1, []], expected: true },
  { name: 'several independent courses', input: [3, []], expected: true },
  {
    name: 'a chain of three',
    input: [
      3,
      [
        [1, 0],
        [2, 1],
      ],
    ],
    expected: true,
  },
  {
    name: 'a cycle of three',
    input: [
      3,
      [
        [1, 0],
        [2, 1],
        [0, 2],
      ],
    ],
    expected: false,
  },

  // ---- hidden -------------------------------------------------------------
  { name: 'a self-dependency is a cycle', input: [1, [[0, 0]]], expected: false, hidden: true },
  {
    name: 'a diamond is acyclic',
    input: [
      4,
      [
        [1, 0],
        [2, 0],
        [3, 1],
        [3, 2],
      ],
    ],
    expected: true,
    hidden: true,
  },
  {
    name: 'duplicate edges do not create a cycle',
    input: [
      2,
      [
        [1, 0],
        [1, 0],
      ],
    ],
    expected: true,
    hidden: true,
  },
  {
    name: 'a cycle hidden among valid courses',
    input: [
      5,
      [
        [1, 0],
        [2, 1],
        [3, 4],
        [4, 3],
      ],
    ],
    expected: false,
    hidden: true,
  },
  {
    name: 'two independent chains',
    input: [
      4,
      [
        [1, 0],
        [3, 2],
      ],
    ],
    expected: true,
    hidden: true,
  },
  {
    name: 'one course feeding many',
    input: [
      4,
      [
        [1, 0],
        [2, 0],
        [3, 0],
      ],
    ],
    expected: true,
    hidden: true,
  },
  {
    name: 'many courses feeding one',
    input: [
      4,
      [
        [3, 0],
        [3, 1],
        [3, 2],
      ],
    ],
    expected: true,
    hidden: true,
  },
  {
    name: 'a long chain with the cycle at the far end',
    input: [
      5,
      [
        [1, 0],
        [2, 1],
        [3, 2],
        [4, 3],
        [2, 4],
      ],
    ],
    expected: false,
    hidden: true,
  },

  // ---- performance --------------------------------------------------------
  // 100k courses in one chain: a recursive DFS is 100k frames deep, and an adjacency list built as
  // 100k separate arrays is measurably slower than one flat allocation.
  {
    name: '100k courses in a single chain',
    input: [N, chain],
    expected: true,
    hidden: true,
    perf: true,
  },
  {
    name: '100k courses with one edge closing the loop',
    input: [N, chainWithCycle],
    expected: false,
    hidden: true,
    perf: true,
  },
];
