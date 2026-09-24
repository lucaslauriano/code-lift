import type { TestCase } from '@code-lift/shared';

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

function node(val: number, left: TreeNode | null = null, right: TreeNode | null = null): TreeNode {
  return { val, left, right };
}

/** A perfectly balanced tree of 2^levels - 1 nodes; its depth is `levels`. */
function balanced(levels: number): TreeNode | null {
  if (levels === 0) return null;
  return node(levels, balanced(levels - 1), balanced(levels - 1));
}

/** A chain of `length` nodes, each hanging off the right of the last. Depth equals length. */
function chain(length: number): TreeNode | null {
  let root: TreeNode | null = null;
  for (let i = length; i >= 1; i -= 1) root = node(i, null, root);
  return root;
}

const BALANCED_LEVELS = 17; // 131,071 nodes
const CHAIN_LENGTH = 100_000;

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  {
    name: 'the worked example',
    input: [node(3, node(9), node(20, node(15), node(7)))],
    expected: 3,
  },
  { name: 'only a right child', input: [node(1, null, node(2))], expected: 2 },
  { name: 'an empty tree', input: [null], expected: 0 },
  { name: 'a single node', input: [node(1)], expected: 1 },
  { name: 'two levels, both children', input: [node(1, node(2), node(3))], expected: 2 },
  { name: 'only a left child', input: [node(1, node(2))], expected: 2 },

  // ---- hidden -------------------------------------------------------------
  {
    name: 'left-leaning chain of three',
    input: [node(1, node(2, node(3)))],
    expected: 3,
    hidden: true,
  },
  {
    name: 'the deeper side is on the right',
    input: [node(1, node(2), node(3, null, node(4)))],
    expected: 3,
    hidden: true,
  },
  {
    name: 'the deeper side is on the left',
    input: [node(1, node(2, node(3)), node(4))],
    expected: 3,
    hidden: true,
  },
  {
    name: 'negative values do not affect depth',
    input: [node(-10, node(-20), node(-30))],
    expected: 2,
    hidden: true,
  },
  { name: 'a balanced tree of seven', input: [balanced(3)], expected: 3, hidden: true },
  { name: 'a chain of ten', input: [chain(10)], expected: 10, hidden: true },
  {
    name: 'wide but shallow',
    input: [node(1, node(2, node(4), node(5)), node(3))],
    expected: 3,
    hidden: true,
  },
  { name: 'a single zero value', input: [node(0)], expected: 1, hidden: true },

  // ---- performance --------------------------------------------------------
  // The chain is the case that matters: 100,000 frames of recursion overflows the stack, so a
  // recursive solution fails here for a reason that has nothing to do with speed.
  {
    name: '131k nodes, perfectly balanced',
    input: [balanced(BALANCED_LEVELS)],
    expected: BALANCED_LEVELS,
    hidden: true,
    perf: true,
  },
  {
    name: '100k nodes in a single chain',
    input: [chain(CHAIN_LENGTH)],
    expected: CHAIN_LENGTH,
    hidden: true,
    perf: true,
  },
];
