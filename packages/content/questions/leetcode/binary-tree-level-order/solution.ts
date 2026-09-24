export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

/**
 * Breadth-first, one whole level per outer iteration.
 *
 * Reading the queue's length *before* the inner loop is the entire technique: at that moment the
 * queue holds exactly one level, so that count says where the level ends even as children are
 * appended behind it.
 *
 * The queue is a plain array with a moving head index rather than `shift()`. On a wide tree
 * `shift()` reindexes the whole queue on every node, which turns the traversal quadratic — with
 * 100,000 nodes in one level that is five billion moves.
 *
 * Time  O(N).
 * Space O(W), the widest level.
 */
export function solution(root: TreeNode | null): number[][] {
  if (root === null) return [];

  const levels: number[][] = [];
  const queue: TreeNode[] = [root];
  let head = 0;

  while (head < queue.length) {
    const levelSize = queue.length - head;
    const level: number[] = new Array<number>(levelSize);

    for (let i = 0; i < levelSize; i += 1) {
      const node = queue[head] as TreeNode;
      head += 1;
      level[i] = node.val;
      if (node.left !== null) queue.push(node.left);
      if (node.right !== null) queue.push(node.right);
    }

    levels.push(level);
  }

  return levels;
}
