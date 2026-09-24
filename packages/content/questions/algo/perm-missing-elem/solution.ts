/**
 * The array should contain every value from 1 to N+1 and is missing exactly one, so the gap is the
 * difference between the sum it ought to have and the sum it does have.
 *
 * Gauss gives the expected total without a second loop: 1 + 2 + … + (N+1) = (N+1)(N+2)/2.
 *
 * Time  O(N) — a single pass to add things up.
 * Space O(1) — two numbers, regardless of input size.
 */
export function solution(a: number[]): number {
  const n = a.length;
  const expected = ((n + 1) * (n + 2)) / 2;

  let actual = 0;
  for (const value of a) actual += value;

  return expected - actual;
}
