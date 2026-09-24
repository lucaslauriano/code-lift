export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

/**
 * Inorder with an explicit stack.
 *
 * The loop mirrors what recursion does: dive left as far as possible pushing every node passed,
 * then pop — that node's left subtree is finished, so its value comes next — and turn right.
 *
 * Written iteratively because a degenerate tree of 100,000 nodes is 100,000 frames deep, and a
 * recursive traversal overflows before it can be slow.
 *
 * Time  O(N) — each node is pushed once and popped once.
 * Space O(H).
 */
export function solution(root: TreeNode | null): number[] {
  const values: number[] = [];
  const stack: TreeNode[] = [];
  let node: TreeNode | null = root;

  while (node !== null || stack.length > 0) {
    while (node !== null) {
      stack.push(node);
      node = node.left;
    }

    const current = stack.pop() as TreeNode;
    values.push(current.val);
    node = current.right;
  }

  return values;
}
