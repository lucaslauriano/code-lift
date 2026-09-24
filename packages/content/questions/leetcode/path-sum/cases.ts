import type { TestCase } from '@code-lift/shared';

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

function node(val: number, left: TreeNode | null = null, right: TreeNode | null = null): TreeNode {
  return { val, left, right };
}

/** A right-leaning chain of `length` ones: the only root-to-leaf sum is `length`. */
function chainOfOnes(length: number): TreeNode | null {
  let root: TreeNode | null = null;
  for (let i = 0; i < length; i += 1) root = node(1, null, root);
  return root;
}

const example = node(
  5,
  node(4, node(11, node(7), node(2))),
  node(8, node(13), node(4, null, node(1))),
);

const DEEP = 100_000;

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'the worked example', input: [example, 22], expected: true },
  { name: 'no path adds up', input: [node(1, node(2), node(3)), 5], expected: false },
  { name: 'an empty tree is false even for zero', input: [null, 0], expected: false },
  { name: 'a single node that matches', input: [node(7), 7], expected: true },
  { name: 'a single node that does not', input: [node(7), 8], expected: false },
  { name: 'the target is on the left path', input: [node(1, node(2), node(3)), 3], expected: true },

  // ---- hidden -------------------------------------------------------------
  {
    name: 'a matching sum at a node with one child does not count',
    input: [node(1, node(2)), 1],
    expected: false,
    hidden: true,
  },
  {
    name: 'that same tree matched at the leaf',
    input: [node(1, node(2)), 3],
    expected: true,
    hidden: true,
  },
  {
    name: 'negative values make the sum dip and recover',
    input: [node(5, node(-3, node(20))), 21],
    expected: false,
    hidden: true,
  },
  {
    name: 'negatives that do add up',
    input: [node(5, node(-3, node(20))), 22],
    expected: true,
    hidden: true,
  },
  {
    name: 'zero values with a zero target',
    input: [node(0, node(0), node(0)), 0],
    expected: true,
    hidden: true,
  },
  {
    name: 'the deeper path is the matching one',
    input: [node(1, node(2), node(3, node(4))), 8],
    expected: true,
    hidden: true,
  },
  {
    // The reachable sums here are 3 and 4, so 6 is the near miss.
    name: 'close but unreachable',
    input: [node(1, node(2), node(3)), 6],
    expected: false,
    hidden: true,
  },
  { name: 'a right-leaning chain', input: [chainOfOnes(5), 5], expected: true, hidden: true },

  // ---- performance --------------------------------------------------------
  // 100k deep, which overflows a recursive walk. The second target is unreachable, so nothing can
  // exit early and the whole tree is visited.
  {
    name: '100k deep chain, the sum matches',
    input: [chainOfOnes(DEEP), DEEP],
    expected: true,
    hidden: true,
    perf: true,
  },
  {
    name: '100k deep chain, no path matches',
    input: [chainOfOnes(DEEP), DEEP + 1],
    expected: false,
    hidden: true,
    perf: true,
  },
];
