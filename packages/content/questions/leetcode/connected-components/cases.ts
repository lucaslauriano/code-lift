import type { TestCase } from '@code-lift/shared';

const N = 100_000;

/** One long path through every node: a single component. */
const path = Array.from({ length: N - 1 }, (_, i) => [i, i + 1]);

/** Pairs only: node 2k joined to node 2k+1, giving N/2 components. */
const pairs = Array.from({ length: N / 2 }, (_, i) => [i * 2, i * 2 + 1]);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  {
    name: 'two components',
    input: [
      5,
      [
        [0, 1],
        [1, 2],
        [3, 4],
      ],
    ],
    expected: 2,
  },
  {
    name: 'one component',
    input: [
      5,
      [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
      ],
    ],
    expected: 1,
  },
  { name: 'no edges at all', input: [4, []], expected: 4 },
  { name: 'a single node', input: [1, []], expected: 1 },
  { name: 'two nodes, one edge', input: [2, [[0, 1]]], expected: 1 },
  { name: 'two nodes, no edge', input: [2, []], expected: 2 },

  // ---- hidden -------------------------------------------------------------
  {
    name: 'a duplicate edge changes nothing',
    input: [
      2,
      [
        [0, 1],
        [0, 1],
      ],
    ],
    expected: 1,
    hidden: true,
  },
  {
    name: 'an edge inside a component changes nothing',
    input: [
      3,
      [
        [0, 1],
        [1, 2],
        [0, 2],
      ],
    ],
    expected: 1,
    hidden: true,
  },
  {
    name: 'a star',
    input: [
      4,
      [
        [0, 1],
        [0, 2],
        [0, 3],
      ],
    ],
    expected: 1,
    hidden: true,
  },
  {
    name: 'an isolated node beside a component',
    input: [
      4,
      [
        [0, 1],
        [1, 2],
      ],
    ],
    expected: 2,
    hidden: true,
  },
  {
    name: 'edges given out of order',
    input: [
      4,
      [
        [2, 3],
        [0, 1],
      ],
    ],
    expected: 2,
    hidden: true,
  },
  {
    name: 'a cycle is still one component',
    input: [
      4,
      [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ],
    ],
    expected: 1,
    hidden: true,
  },
  {
    name: 'three separate pairs',
    input: [
      6,
      [
        [0, 1],
        [2, 3],
        [4, 5],
      ],
    ],
    expected: 3,
    hidden: true,
  },
  {
    name: 'two components joined last',
    input: [
      6,
      [
        [0, 1],
        [2, 3],
        [4, 5],
        [1, 2],
        [3, 4],
      ],
    ],
    expected: 1,
    hidden: true,
  },

  // ---- performance --------------------------------------------------------
  // 100k nodes. The path is the case that punishes a union-find without path compression, and the
  // depth that would overflow a recursive traversal.
  { name: '100k nodes in one path', input: [N, path], expected: 1, hidden: true, perf: true },
  {
    name: '100k nodes joined in pairs',
    input: [N, pairs],
    expected: N / 2,
    hidden: true,
    perf: true,
  },
];
