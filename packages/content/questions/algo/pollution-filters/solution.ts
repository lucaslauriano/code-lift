/**
 * The cost at position i needs the sum of a suffix, and computing each suffix from scratch is the
 * quadratic trap. A running total from the right gives every suffix in one backwards pass.
 *
 * Walking backwards is what removes the need for a prefix array at all: after handling position i,
 * adding P[i] turns the suffix "after i" into the suffix "after i-1".
 *
 * Time  O(N).
 * Space O(1) — the classic prefix-sum array is O(N) and unnecessary here.
 */
export function solution(p: number[]): number {
  let downstream = 0;
  let total = 0;

  for (let i = p.length - 1; i >= 0; i -= 1) {
    total += Math.ceil(downstream / 2);
    downstream += p[i] as number;
  }

  return total;
}
