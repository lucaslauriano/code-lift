import type { TestCase } from '@code-lift/shared';

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

function node(val: number, left: TreeNode | null = null, right: TreeNode | null = null): TreeNode {
  return { val, left, right };
}

/** A balanced BST over 1..size — valid by construction. */
function bst(size: number): TreeNode | null {
  const build = (lo: number, hi: number): TreeNode | null => {
    if (lo > hi) return null;
    const mid = (lo + hi) >> 1;
    return node(mid + 1, build(lo, mid - 1), build(mid + 1, hi));
  };
  return build(0, size - 1);
}

/** A right-leaning chain of 1..length — a valid, maximally deep BST. */
function ascendingChain(length: number): TreeNode | null {
  let root: TreeNode | null = null;
  for (let value = length; value >= 1; value -= 1) root = node(value, null, root);
  return root;
}

/** The same chain with the deepest value broken, so the violation is only found at the very end. */
function brokenAtTheBottom(length: number): TreeNode | null {
  let root: TreeNode | null = node(0);
  for (let value = length - 1; value >= 1; value -= 1) root = node(value, null, root);
  return root;
}

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'a minimal valid BST', input: [node(2, node(1), node(3))], expected: true },
  {
    name: 'a grandchild violates the root bound',
    input: [node(5, node(1), node(4, node(3), node(6)))],
    expected: false,
  },
  { name: 'an empty tree', input: [null], expected: true },
  { name: 'a single node', input: [node(1)], expected: true },
  { name: 'the left child is too large', input: [node(1, node(2))], expected: false },
  { name: 'the right child is too small', input: [node(2, null, node(1))], expected: false },

  // ---- hidden -------------------------------------------------------------
  {
    name: 'equal values are not allowed',
    input: [node(1, node(1))],
    expected: false,
    hidden: true,
  },
  {
    name: 'equal values on the right either',
    input: [node(1, null, node(1))],
    expected: false,
    hidden: true,
  },
  { name: 'a valid chain going right', input: [ascendingChain(5)], expected: true, hidden: true },
  {
    name: 'a valid chain going left',
    input: [node(3, node(2, node(1)))],
    expected: true,
    hidden: true,
  },
  {
    name: 'negative values, valid',
    input: [node(0, node(-5), node(5))],
    expected: true,
    hidden: true,
  },
  {
    name: 'the violation is deep on the left',
    input: [node(10, node(5, node(1), node(12)), node(15))],
    expected: false,
    hidden: true,
  },
  {
    name: 'integer boundary values, valid',
    input: [node(0, node(-2147483648), node(2147483647))],
    expected: true,
    hidden: true,
  },
  { name: 'a balanced BST of seven', input: [bst(7)], expected: true, hidden: true },

  // ---- performance --------------------------------------------------------
  // 100k nodes, and the second one hides the violation at the deepest point so nothing can exit
  // early. Both chains are 100k deep, which overflows a recursive walk.
  {
    name: '100k nodes, a valid right-leaning chain',
    input: [ascendingChain(100_000)],
    expected: true,
    hidden: true,
    perf: true,
  },
  {
    name: '100k nodes, broken only at the bottom',
    input: [brokenAtTheBottom(100_000)],
    expected: false,
    hidden: true,
    perf: true,
  },
];
