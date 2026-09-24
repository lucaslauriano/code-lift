/**
 * Every westbound car pairs with every eastbound car that came before it. So a single left-to-right
 * pass suffices: keep a running count of eastbound cars seen so far, and each time a westbound car
 * appears, add that count to the total.
 *
 * The 1,000,000,000 cap is checked inside the loop rather than at the end. With N = 100,000 the
 * theoretical maximum is 2.5 * 10^9, which still fits exactly in a double — but bailing early makes
 * the intent explicit and costs nothing.
 *
 * Time  O(N).
 * Space O(1).
 */
const LIMIT = 1_000_000_000;

export function solution(a: number[]): number {
  let eastboundSoFar = 0;
  let pairs = 0;

  for (const car of a) {
    if (car === 0) {
      eastboundSoFar += 1;
    } else {
      pairs += eastboundSoFar;
      if (pairs > LIMIT) return -1;
    }
  }

  return pairs;
}
