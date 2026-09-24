/**
 * A write pointer trailing a read pointer.
 *
 * The read pointer visits everything; the write pointer only advances when something non-zero is
 * placed. When the scan ends, the write pointer marks exactly where the zeros begin, so filling the
 * tail finishes the job.
 *
 * Swapping on every non-zero element also works and is the more common answer, but it performs a
 * write even when the two pointers coincide — that is, on every element of an array with no zeros
 * at all. Compacting then filling touches each slot once.
 *
 * Time  O(N).
 * Space O(1) — the input array is rewritten in place.
 */
export function solution(nums: number[]): number[] {
  let write = 0;

  for (let read = 0; read < nums.length; read += 1) {
    const value = nums[read] as number;
    if (value !== 0) {
      nums[write] = value;
      write += 1;
    }
  }

  for (let i = write; i < nums.length; i += 1) nums[i] = 0;

  return nums;
}
