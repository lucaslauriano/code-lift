import type { TestCase } from '@code-lift/shared';

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

function node(val: number, left: TreeNode | null = null, right: TreeNode | null = null): TreeNode {
  return { val, left, right };
}

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  {
    name: 'the worked example',
    input: [node(1, node(2, null, node(5)), node(3))],
    expected: ['1->2->5', '1->3'],
  },
  { name: 'a single node', input: [node(1)], expected: ['1'] },
  { name: 'an empty tree', input: [null], expected: [] },
  { name: 'two nodes on the left', input: [node(1, node(2))], expected: ['1->2'] },
  { name: 'two nodes on the right', input: [node(1, null, node(2))], expected: ['1->2'] },
  { name: 'two leaves', input: [node(1, node(2), node(3))], expected: ['1->2', '1->3'] },

  // ---- hidden -------------------------------------------------------------
  {
    name: 'a node with one child is not a leaf',
    input: [node(1, node(2, node(4)), node(3))],
    expected: ['1->2->4', '1->3'],
    hidden: true,
  },
  {
    name: 'four leaves',
    input: [node(1, node(2, node(4), node(5)), node(3, node(6), node(7)))],
    expected: ['1->2->4', '1->2->5', '1->3->6', '1->3->7'],
    hidden: true,
  },
  {
    name: 'negative values',
    input: [node(-1, node(-2), node(-3))],
    expected: ['-1->-2', '-1->-3'],
    hidden: true,
  },
  { name: 'zero values', input: [node(0, node(0))], expected: ['0->0'], hidden: true },
  {
    name: 'a left-leaning chain',
    input: [node(1, node(2, node(3, node(4))))],
    expected: ['1->2->3->4'],
    hidden: true,
  },
  {
    name: 'a right-leaning chain',
    input: [node(1, null, node(2, null, node(3)))],
    expected: ['1->2->3'],
    hidden: true,
  },
  {
    name: 'branches of different depths',
    input: [node(1, node(2), node(3, node(4, node(5))))],
    expected: ['1->2', '1->3->4->5'],
    hidden: true,
  },
  {
    name: 'repeated values do not merge paths',
    input: [node(1, node(1), node(1))],
    expected: ['1->1', '1->1'],
    hidden: true,
  },
];
