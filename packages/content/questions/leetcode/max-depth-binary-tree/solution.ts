export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

/**
 * Depth-first with an explicit stack rather than recursion.
 *
 * The recursive version is three lines and is what most people write, but its stack depth is the
 * tree's height — and a degenerate tree of 100,000 nodes is 100,000 frames deep, which overflows.
 * Carrying the depth alongside each node on an explicit stack costs a few lines and removes the
 * limit entirely.
 *
 * Time  O(N) — every node is pushed and popped once.
 * Space O(H) for the stack, which is O(N) on a degenerate tree.
 */
export function solution(root: TreeNode | null): number {
  if (root === null) return 0;

  const nodes: TreeNode[] = [root];
  const depths: number[] = [1];
  let deepest = 0;

  while (nodes.length > 0) {
    const node = nodes.pop() as TreeNode;
    const depth = depths.pop() as number;

    if (depth > deepest) deepest = depth;

    if (node.left !== null) {
      nodes.push(node.left);
      depths.push(depth + 1);
    }
    if (node.right !== null) {
      nodes.push(node.right);
      depths.push(depth + 1);
    }
  }

  return deepest;
}
