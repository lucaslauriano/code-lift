/**
 * The multiplication principle: independent choices multiply. What makes this more than a one-liner
 * is the word *distinct* — a repeated city is one choice, not two — so each array has to collapse
 * to its set of unique values first.
 *
 * Time  O(|A| + |B| + |C|) — one pass per array to build the sets.
 * Space O(|A| + |B| + |C|).
 */
const LIMIT = 1_000_000_000;

export function solution(a: number[], b: number[], c: number[]): number {
  const routes = new Set(a).size * new Set(b).size * new Set(c).size;
  return routes > LIMIT ? -1 : routes;
}
