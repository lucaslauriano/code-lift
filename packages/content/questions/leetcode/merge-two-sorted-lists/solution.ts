export interface ListNode {
  val: number;
  next: ListNode | null;
}

/**
 * Walk both lists at once, always taking the smaller head.
 *
 * A dummy node in front of the result is what removes the special case: without it, every append
 * needs an "is this the first one?" check to decide between setting the head and extending the
 * tail. With it, there is only ever a tail.
 *
 * Whichever list still has nodes at the end is already sorted and already linked, so it gets
 * attached in one move rather than copied node by node.
 *
 * Time  O(N + M).
 * Space O(1) — one dummy node, and the input nodes are relinked in place.
 */
export function solution(list1: ListNode | null, list2: ListNode | null): ListNode | null {
  const dummy: ListNode = { val: 0, next: null };
  let tail = dummy;

  let a = list1;
  let b = list2;

  while (a !== null && b !== null) {
    if (a.val <= b.val) {
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }

  tail.next = a !== null ? a : b;

  return dummy.next;
}
