export interface ListNode {
  val: number;
  next: ListNode | null;
}

/**
 * Three pointers, walking forward once and flipping each link as it goes.
 *
 * The order inside the loop is the whole problem: `next` has to be saved before `current.next` is
 * overwritten, or the rest of the list is unreachable and the walk ends after one node.
 *
 * Iterative rather than recursive: a 100,000-node list is 100,000 frames deep, and the recursive
 * version overflows long before it is slow.
 *
 * Time  O(N).
 * Space O(1).
 */
export function solution(head: ListNode | null): ListNode | null {
  let previous: ListNode | null = null;
  let current: ListNode | null = head;

  while (current !== null) {
    const next: ListNode | null = current.next;
    current.next = previous;
    previous = current;
    current = next;
  }

  return previous;
}
