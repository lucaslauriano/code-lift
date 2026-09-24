/**
 * Halve the search window until it is empty.
 *
 * Three decisions make or break this loop, and each one has a wrong version that looks fine:
 *
 *   `low <= high`  — with `<`, a window of one element is never examined, so a target sitting alone
 *                    at the end is reported missing.
 *   `high = mid-1` — with `high = mid`, the window stops shrinking once it holds one element and
 *                    the loop never terminates.
 *   `low + (high-low)/2` — equivalent to `(low+high)/2` in JavaScript, where numbers are doubles,
 *                    but the direct sum overflows in a fixed-width integer language. Writing it
 *                    this way costs nothing and is the habit that matters.
 *
 * Time  O(log N).
 * Space O(1).
 */
export function solution(nums: number[], target: number): number {
  let low = 0;
  let high = nums.length - 1;

  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    const value = nums[mid] as number;

    if (value === target) return mid;
    if (value < target) low = mid + 1;
    else high = mid - 1;
  }

  return -1;
}
