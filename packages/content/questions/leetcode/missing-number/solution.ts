/**
 * XOR every index together with every value.
 *
 * Fold 0..n and the array into one accumulator: each present value meets its own index and cancels,
 * and the missing one has nothing to cancel against. XOR is used instead of the sum formula because
 * it cannot overflow — with n at 100,000 the sum reaches 5 billion, which is past a 32-bit int.
 *
 * Time  O(N).
 * Space O(1).
 */
export function solution(nums: number[]): number {
  let result = nums.length;

  for (let i = 0; i < nums.length; i += 1) {
    result ^= i ^ (nums[i] as number);
  }

  return result;
}
