import type { TestCase } from '@code-lift/shared';

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

function node(val: number, left: TreeNode | null = null, right: TreeNode | null = null): TreeNode {
  return { val, left, right };
}

/**
 * A perfect tree of `levels` levels where every node holds its depth.
 * Level k therefore contains 2^k copies of k.
 */
function perfect(levels: number): { root: TreeNode | null; expected: number[][] } {
  const build = (depth: number): TreeNode | null =>
    depth === levels ? null : node(depth, build(depth + 1), build(depth + 1));
  const expected = Array.from({ length: levels }, (_, depth) =>
    new Array<number>(2 ** depth).fill(depth),
  );
  return { root: build(0), expected };
}

/** A right-leaning chain: one node per level, holding its depth. */
function chain(length: number): { root: TreeNode | null; expected: number[][] } {
  let root: TreeNode | null = null;
  for (let depth = length - 1; depth >= 0; depth -= 1) root = node(depth, null, root);
  return { root, expected: Array.from({ length }, (_, depth) => [depth]) };
}

const wide = perfect(16); // 65,535 nodes, the last level alone holds 32,768
const deep = chain(100_000);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  {
    name: 'the worked example',
    input: [node(3, node(9), node(20, node(15), node(7)))],
    expected: [[3], [9, 20], [15, 7]],
  },
  { name: 'a single node', input: [node(1)], expected: [[1]] },
  { name: 'an empty tree', input: [null], expected: [] },
  { name: 'only a left child', input: [node(1, node(2))], expected: [[1], [2]] },
  { name: 'only a right child', input: [node(1, null, node(2))], expected: [[1], [2]] },
  { name: 'a full second level', input: [node(1, node(2), node(3))], expected: [[1], [2, 3]] },

  // ---- hidden -------------------------------------------------------------
  {
    // Order within a level follows the parents, not the values.
    name: 'a level is not sorted',
    input: [node(1, node(9), node(2))],
    expected: [[1], [9, 2]],
    hidden: true,
  },
  {
    name: 'a gap on one side does not shift the other',
    input: [node(1, node(2, null, node(4)), node(3))],
    expected: [[1], [2, 3], [4]],
    hidden: true,
  },
  {
    name: 'a left-leaning chain',
    input: [node(1, node(2, node(3)))],
    expected: [[1], [2], [3]],
    hidden: true,
  },
  {
    name: 'negative values',
    input: [node(-1, node(-2), node(-3))],
    expected: [[-1], [-2, -3]],
    hidden: true,
  },
  {
    name: 'a perfect tree of three levels',
    input: [perfect(3).root],
    expected: perfect(3).expected,
    hidden: true,
  },
  {
    name: 'an unbalanced last level',
    input: [node(1, node(2, node(4), node(5)), node(3, null, node(6)))],
    expected: [[1], [2, 3], [4, 5, 6]],
    hidden: true,
  },
  { name: 'a chain of five', input: [chain(5).root], expected: chain(5).expected, hidden: true },
  { name: 'zero values', input: [node(0, node(0))], expected: [[0], [0]], hidden: true },

  // ---- performance --------------------------------------------------------
  // The wide tree is where `queue.shift()` becomes quadratic; the deep chain is where recursion
  // would overflow. Both shapes have to work.
  {
    name: '65k nodes, perfectly balanced',
    input: [wide.root],
    expected: wide.expected,
    hidden: true,
    perf: true,
  },
  {
    name: '100k nodes, one per level',
    input: [deep.root],
    expected: deep.expected,
    hidden: true,
    perf: true,
  },
];
