/**
 * Walk forward once, marking each position the first time a leaf lands on it and counting how many
 * distinct positions are covered so far. The answer is the index at which that counter first
 * reaches X — no need to look at the rest of the array.
 *
 * The key is counting *distinct* positions rather than re-checking the whole span on every step:
 * each leaf either increments the counter (first time on that position) or is a no-op.
 *
 * Time  O(N) — one pass, O(1) work per leaf.
 * Space O(X) for the coverage map.
 */
export function solution(x: number, a: number[]): number {
  const covered = new Uint8Array(x + 1);
  let remaining = x;

  for (let time = 0; time < a.length; time += 1) {
    const position = a[time] as number;
    if (position >= 1 && position <= x && covered[position] === 0) {
      covered[position] = 1;
      remaining -= 1;
      if (remaining === 0) return time;
    }
  }

  return -1;
}
