/**
 * The only ways into a cell are from the left and from above, so paths(r, c) is the sum of those
 * two. The first row and first column have exactly one path each — there is only one direction
 * available.
 *
 * The full table is m x n, but computing row by row means only the previous row is ever read. And
 * because a row is filled left to right, the value being overwritten at each position is exactly
 * the "from above" term while the value already written to its left is the "from the left" term —
 * so a single array of width n suffices, updated in place.
 *
 * Time  O(M * N).
 * Space O(N).
 */
export function solution(m: number, n: number): number {
  const row = new Array<number>(n).fill(1);

  for (let r = 1; r < m; r += 1) {
    for (let c = 1; c < n; c += 1) {
      row[c] = (row[c] as number) + (row[c - 1] as number);
    }
  }

  return row[n - 1] as number;
}
