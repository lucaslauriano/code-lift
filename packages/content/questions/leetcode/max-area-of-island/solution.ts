/**
 * Same flood fill as counting islands, except each fill returns how many cells it consumed and the
 * largest of those wins.
 *
 * Counting inside an iterative fill is where this differs from the recursive version people
 * usually reach for: recursion lets the area be `1 + sum of children`, while a stack has to tally
 * as it pops. A single counter next to the loop does it.
 *
 * Iterative because a 300x300 grid of solid land is one region of 90,000 cells, and a recursive
 * fill is that deep.
 *
 * Time  O(R * C).
 * Space O(R * C).
 */
export function solution(grid: number[][]): number {
  const rows = grid.length;
  if (rows === 0) return 0;
  const cols = (grid[0] as number[]).length;

  let largest = 0;
  const stack: number[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if ((grid[row] as number[])[col] !== 1) continue;

      let area = 0;
      stack.push(row * cols + col);
      (grid[row] as number[])[col] = 0;

      while (stack.length > 0) {
        const cell = stack.pop() as number;
        area += 1;
        const r = Math.floor(cell / cols);
        const c = cell % cols;

        if (r > 0 && (grid[r - 1] as number[])[c] === 1) {
          (grid[r - 1] as number[])[c] = 0;
          stack.push((r - 1) * cols + c);
        }
        if (r + 1 < rows && (grid[r + 1] as number[])[c] === 1) {
          (grid[r + 1] as number[])[c] = 0;
          stack.push((r + 1) * cols + c);
        }
        if (c > 0 && (grid[r] as number[])[c - 1] === 1) {
          (grid[r] as number[])[c - 1] = 0;
          stack.push(r * cols + (c - 1));
        }
        if (c + 1 < cols && (grid[r] as number[])[c + 1] === 1) {
          (grid[r] as number[])[c + 1] = 0;
          stack.push(r * cols + (c + 1));
        }
      }

      if (area > largest) largest = area;
    }
  }

  return largest;
}
