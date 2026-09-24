/**
 * Sort ascending, then only consider consecutive triplets.
 *
 * Why consecutive is enough: once sorted, if any triangular triplet exists, some *adjacent* one
 * does too. Spreading the two smaller values further apart can only shrink their sum, and pulling
 * the largest value inward can only shrink it — so the adjacent triplet (i, i+1, i+2) is the most
 * favourable arrangement at that scale. If it fails, nothing built around that largest value works.
 *
 * With a sorted array, two of the three inequalities are automatic: A[i] + A[i+2] > A[i+1] and
 * A[i+1] + A[i+2] > A[i] both hold whenever the values are non-negative and ordered. Only
 * A[i] + A[i+1] > A[i+2] has to be tested.
 *
 * Time  O(N log N) — the sort dominates.
 * Space O(N) — a copy, because mutating the caller's array is a side effect.
 */
export function solution(a: number[]): number {
  if (a.length < 3) return 0;

  const sorted = [...a].sort((x, y) => x - y);

  for (let i = 0; i + 2 < sorted.length; i += 1) {
    const p = sorted[i] as number;
    const q = sorted[i + 1] as number;
    const r = sorted[i + 2] as number;
    // Written as p > r - q rather than p + q > r: both values fit in 32 bits, but their sum does
    // not, and in a language with fixed-width integers that addition silently overflows.
    if (p > r - q) return 1;
  }

  return 0;
}
