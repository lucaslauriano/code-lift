export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

/**
 * Depth-first with an explicit stack, carrying what is still owed alongside each node.
 *
 * Subtracting on the way down instead of accumulating means the check at a leaf is just
 * `remaining === node.val` — no need to pass the target around separately.
 *
 * The leaf test is the part worth being careful about: a node with one child is not a leaf, so the
 * path cannot end there even if the sum happens to match.
 *
 * Time  O(N), stopping as soon as a path works.
 * Space O(H).
 */
export function solution(root: TreeNode | null, targetSum: number): boolean {
  if (root === null) return false;

  const nodes: TreeNode[] = [root];
  const remaining: number[] = [targetSum];

  while (nodes.length > 0) {
    const node = nodes.pop() as TreeNode;
    const owed = remaining.pop() as number;

    if (node.left === null && node.right === null) {
      if (owed === node.val) return true;
      continue;
    }

    if (node.left !== null) {
      nodes.push(node.left);
      remaining.push(owed - node.val);
    }
    if (node.right !== null) {
      nodes.push(node.right);
      remaining.push(owed - node.val);
    }
  }

  return false;
}
