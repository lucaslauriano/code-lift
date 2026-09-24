/**
 * Insert into a set and stop the moment an insert finds something already there.
 *
 * Returning early matters more than it looks: `new Set(nums).size !== nums.length` is the same idea
 * in one line, but it always builds the whole set. Bailing at the first repeat turns the common
 * case — a duplicate near the front — into a couple of operations instead of N.
 *
 * Time  O(N) worst case, far less when a duplicate appears early.
 * Space O(N).
 */
export function solution(nums: number[]): boolean {
  const seen = new Set<number>();

  for (const value of nums) {
    if (seen.has(value)) return true;
    seen.add(value);
  }

  return false;
}
