/**
 * With N elements, the answer can never exceed N + 1: even the array [1, 2, …, N] leaves N + 1 free.
 * So anything outside [1 .. N] is irrelevant and can be dropped on sight.
 *
 * Mark the relevant values in a flat array indexed by the value itself, then scan from 1 upwards for
 * the first hole. Both passes are linear and neither sorts anything.
 *
 * Time  O(N).
 * Space O(N).
 */
export function solution(a: number[]): number {
  const n = a.length;
  const seen = new Uint8Array(n + 2);

  for (const value of a) {
    if (value >= 1 && value <= n) seen[value] = 1;
  }

  for (let candidate = 1; candidate <= n + 1; candidate += 1) {
    if (seen[candidate] === 0) return candidate;
  }

  // Unreachable: the loop above covers n + 1 candidates and only n can be marked.
  return n + 1;
}
