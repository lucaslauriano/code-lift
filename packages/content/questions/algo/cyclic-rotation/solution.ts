/**
 * After N rotations the array is back where it started, so only `k % n` matters. Once the shift is
 * reduced, the answer is a direct index mapping: the element that ends at position i came from
 * position (i - shift) wrapped around.
 *
 * Building the result by index avoids both the "rotate one step, N times" loop (O(N*K)) and the
 * repeated `unshift`/`pop` (O(N) per step, because unshift reindexes the whole array).
 *
 * Time  O(N).
 * Space O(N) for the result; the input is never mutated.
 */
export function solution(a: number[], k: number): number[] {
  const n = a.length;
  if (n === 0) return [];

  const shift = ((k % n) + n) % n;
  if (shift === 0) return [...a];

  const rotated = new Array<number>(n);
  for (let i = 0; i < n; i += 1) {
    rotated[(i + shift) % n] = a[i] as number;
  }
  return rotated;
}
