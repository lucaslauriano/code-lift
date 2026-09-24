/**
 * The tempting shortcut is that the MEX only ever grows — each flip writes exactly the value that
 * was missing, so surely the next gap is further along. It is not true. Flipping position MEX-1
 * overwrites whatever that card showed, and if that was the last copy of some smaller value, that
 * value goes missing and the MEX jumps *backwards*.
 *
 * So the missing values are kept in a min-heap. Each flip removes one value from the set and adds
 * at most one, which keeps the whole run to O(N log N) instead of the O(N^2) of recomputing the MEX
 * from scratch every round.
 *
 * Termination is worth noting: once position i holds i+1, it can never be flipped again, because
 * flipping it would require i+1 to be missing while that very card is showing it. So there are at
 * most N operations.
 *
 * Time  O(N log N).
 * Space O(N).
 */
export function solution(a: number[]): number {
  const n = a.length;
  const cards = a.slice();

  // Only values in 1..n can ever matter; anything else can never be the MEX.
  const count = new Int32Array(n + 2);
  for (const value of cards) {
    if (value >= 1 && value <= n) count[value] = (count[value] as number) + 1;
  }

  const missing = new MinHeap();
  for (let value = 1; value <= n; value += 1) {
    if (count[value] === 0) missing.push(value);
  }

  let operations = 0;

  for (;;) {
    // The heap may hold values that have since been filled in; drop them.
    let mex = missing.pop();
    while (mex !== undefined && (count[mex] as number) > 0) mex = missing.pop();
    if (mex === undefined || mex > n) return operations;

    const replaced = cards[mex - 1] as number;
    cards[mex - 1] = mex;
    count[mex] = (count[mex] as number) + 1;
    operations += 1;

    if (replaced >= 1 && replaced <= n) {
      count[replaced] = (count[replaced] as number) - 1;
      // The overwritten card may have been the last one showing that value.
      if (count[replaced] === 0) missing.push(replaced);
    }
  }
}

/** A plain binary min-heap; the standard library has no priority queue. */
class MinHeap {
  private readonly items: number[] = [];

  push(value: number): void {
    const items = this.items;
    items.push(value);
    let child = items.length - 1;
    while (child > 0) {
      const parent = (child - 1) >> 1;
      if ((items[parent] as number) <= (items[child] as number)) break;
      const swap = items[parent] as number;
      items[parent] = items[child] as number;
      items[child] = swap;
      child = parent;
    }
  }

  pop(): number | undefined {
    const items = this.items;
    if (items.length === 0) return undefined;

    const top = items[0] as number;
    const last = items.pop() as number;
    if (items.length === 0) return top;

    items[0] = last;
    let parent = 0;
    for (;;) {
      const left = parent * 2 + 1;
      const right = left + 1;
      let smallest = parent;
      if (left < items.length && (items[left] as number) < (items[smallest] as number)) {
        smallest = left;
      }
      if (right < items.length && (items[right] as number) < (items[smallest] as number)) {
        smallest = right;
      }
      if (smallest === parent) break;
      const swap = items[parent] as number;
      items[parent] = items[smallest] as number;
      items[smallest] = swap;
      parent = smallest;
    }

    return top;
  }
}
