export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

/**
 * Walk the tree inorder and check that the values come out strictly increasing.
 *
 * This is the whole trick: inorder on a BST is the sorted order, so validity reduces to "is this
 * sequence ascending?" — one comparison against the previous value, no bounds to thread down the
 * tree, and the "every value in the subtree" condition is handled for free.
 *
 * Iterative because a degenerate tree of 100,000 nodes would overflow a recursive walk, and because
 * the previous value is the only state that needs to survive between nodes.
 *
 * Time  O(N), stopping early on the first violation.
 * Space O(H).
 */
export function solution(root: TreeNode | null): boolean {
  const stack: TreeNode[] = [];
  let node: TreeNode | null = root;
  let previous: number | null = null;

  while (node !== null || stack.length > 0) {
    while (node !== null) {
      stack.push(node);
      node = node.left;
    }

    const current = stack.pop() as TreeNode;
    if (previous !== null && current.val <= previous) return false;
    previous = current.val;
    node = current.right;
  }

  return true;
}
