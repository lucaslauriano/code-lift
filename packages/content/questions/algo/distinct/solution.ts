/**
 * A hash set answers the question directly: insert everything, report the size. Duplicates collapse
 * on insertion, so no comparison logic is needed at all.
 *
 * The statement asks for O(N log N), which is the sort-then-scan bound. A Set beats it at O(N)
 * average — the cost is O(N) space, which the statement allows.
 *
 * Time  O(N) average.
 * Space O(N).
 */
export function solution(a: number[]): number {
  return new Set(a).size;
}
