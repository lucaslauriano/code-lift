/**
 * XOR is its own inverse (x ^ x === 0) and is both commutative and associative, so folding the
 * whole array with it cancels every pair regardless of where the twins sit. What survives is the
 * one value that had no partner.
 *
 * Time  O(N) — a single pass.
 * Space O(1) — one accumulator, no matter how large the array is.
 */
export function solution(a: number[]): number {
  let unpaired = 0;
  for (const value of a) {
    unpaired ^= value;
  }
  return unpaired;
}
