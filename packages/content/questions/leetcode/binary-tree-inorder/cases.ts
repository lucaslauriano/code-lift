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
 * A left-leaning chain of `length` nodes holding 1..length.
 * Inorder visits the deepest node first, so the answer is ascending.
 */
function leftChain(length: number): { root: TreeNode | null; inorder: number[] } {
  let root: TreeNode | null = null;
  for (let value = 1; value <= length; value += 1) root = node(value, root, null);
  return { root, inorder: Array.from({ length }, (_, i) => i + 1) };
}

/**
 * A complete binary search tree over 1..size, built from the sorted values.
 * Inorder over a BST is the sorted order, so the answer is known by construction.
 */
function bst(size: number): { root: TreeNode | null; inorder: number[] } {
  const values = Array.from({ length: size }, (_, i) => i + 1);
  const build = (lo: number, hi: number): TreeNode | null => {
    if (lo > hi) return null;
    const mid = (lo + hi) >> 1;
    return node(values[mid] as number, build(lo, mid - 1), build(mid + 1, hi));
  };
  return { root: build(0, size - 1), inorder: values };
}

const deepChain = leftChain(100_000);
const wideTree = bst(100_000);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'the worked example', input: [node(1, null, node(2, node(3)))], expected: [1, 3, 2] },
  { name: 'an empty tree', input: [null], expected: [] },
  { name: 'a single node', input: [node(1)], expected: [1] },
  { name: 'a left child only', input: [node(2, node(1))], expected: [1, 2] },
  { name: 'a right child only', input: [node(1, null, node(2))], expected: [1, 2] },
  { name: 'both children', input: [node(2, node(1), node(3))], expected: [1, 2, 3] },

  // ---- hidden -------------------------------------------------------------
  {
    name: 'a left-leaning chain',
    input: [node(3, node(2, node(1)))],
    expected: [1, 2, 3],
    hidden: true,
  },
  {
    name: 'a right-leaning chain',
    input: [node(1, null, node(2, null, node(3)))],
    expected: [1, 2, 3],
    hidden: true,
  },
  {
    name: 'negative values',
    input: [node(0, node(-2), node(2))],
    expected: [-2, 0, 2],
    hidden: true,
  },
  {
    name: 'a balanced tree of seven',
    input: [bst(7).root],
    expected: bst(7).inorder,
    hidden: true,
  },
  {
    name: 'duplicates are kept',
    input: [node(1, node(1), node(1))],
    expected: [1, 1, 1],
    hidden: true,
  },
  {
    name: 'a zigzag shape',
    input: [node(5, node(1, null, node(3)), node(9, node(7)))],
    expected: [1, 3, 5, 7, 9],
    hidden: true,
  },
  {
    name: 'two levels, left-heavy',
    input: [node(4, node(2, node(1), node(3)))],
    expected: [1, 2, 3, 4],
    hidden: true,
  },
  { name: 'ten nodes', input: [bst(10).root], expected: bst(10).inorder, hidden: true },

  // ---- performance --------------------------------------------------------
  // The chain is 100,000 deep, which overflows a recursive traversal; the balanced tree is the
  // volume check. Both are only reachable because the harness clones deep inputs iteratively.
  {
    name: '100k nodes in a left-leaning chain',
    input: [deepChain.root],
    expected: deepChain.inorder,
    hidden: true,
    perf: true,
  },
  {
    name: '100k nodes in a balanced tree',
    input: [wideTree.root],
    expected: wideTree.inorder,
    hidden: true,
    perf: true,
  },
];
