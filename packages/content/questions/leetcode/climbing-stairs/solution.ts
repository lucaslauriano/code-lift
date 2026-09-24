/**
 * The last move onto step n came from either step n-1 or step n-2, and those two sets of routes
 * share nothing — so ways(n) = ways(n-1) + ways(n-2). That is Fibonacci, shifted by one.
 *
 * Only the last two values ever matter, so two variables replace the table. The usual dp array is
 * O(N) memory spent on numbers that are never read again.
 *
 * Time  O(N).
 * Space O(1).
 */
export function solution(n: number): number {
  let previous = 1;
  let current = 1;

  for (let step = 2; step <= n; step += 1) {
    const next = previous + current;
    previous = current;
    current = next;
  }

  return current;
}
