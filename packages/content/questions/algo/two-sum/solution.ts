/**
 * One pass, remembering every value already seen and the position it was at.
 *
 * At each element the question is not "which other element pairs with me?" but "have I already
 * seen the number I need?" — and a hash map answers that in O(1). Checking before inserting is
 * what stops a value from pairing with itself.
 *
 * Time  O(N).
 * Space O(N).
 */
export function solution(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();

  for (let index = 0; index < nums.length; index += 1) {
    const value = nums[index] as number;
    const complement = target - value;

    const match = seen.get(complement);
    if (match !== undefined) return [match, index];

    // Only record after the lookup, or a value equal to half the target matches itself.
    if (!seen.has(value)) seen.set(value, index);
  }

  return [];
}
