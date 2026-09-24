export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

/**
 * Depth-first, carrying the path built so far.
 *
 * The prefix is passed down as an immutable string rather than pushed and popped from a shared
 * array. With a shared array you must remember to pop on the way back up, and forgetting is the
 * classic bug here — every path after the first comes out with the previous branch still attached.
 * Passing a value removes the possibility.
 *
 * An explicit stack keeps the left-to-right order by pushing the right child first.
 *
 * Time  O(N * H) — the path string is rebuilt down each branch.
 * Space O(N * H) for the output itself.
 */
export function solution(root: TreeNode | null): string[] {
  if (root === null) return [];

  const paths: string[] = [];
  const nodes: TreeNode[] = [root];
  const prefixes: string[] = [String(root.val)];

  while (nodes.length > 0) {
    const node = nodes.pop() as TreeNode;
    const prefix = prefixes.pop() as string;

    if (node.left === null && node.right === null) {
      paths.push(prefix);
      continue;
    }

    // Right first, so the left branch is popped first and the output reads left to right.
    if (node.right !== null) {
      nodes.push(node.right);
      prefixes.push(`${prefix}->${node.right.val}`);
    }
    if (node.left !== null) {
      nodes.push(node.left);
      prefixes.push(`${prefix}->${node.left.val}`);
    }
  }

  return paths;
}
