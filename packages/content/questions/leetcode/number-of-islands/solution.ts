/**
 * Scan for land; each time some is found that has not been visited, that is one more island, and a
 * flood fill sinks the whole thing so it is never counted again.
 *
 * The fill uses an explicit stack. A recursive fill is shorter and is what most people write, but a
 * grid that is entirely land is one region of ninety thousand cells, and the recursion is that
 * deep — it overflows before it is slow. This is the most common way a correct islands solution
 * fails in practice.
 *
 * Cells are marked by overwriting them with '0' rather than kept in a visited set: the grid is
 * already the right shape for the job and the problem statement allows modifying it.
 *
 * Time  O(R * C) — every cell is visited a constant number of times.
 * Space O(R * C) for the stack in the worst case.
 */
export function solution(grid: string[][]): number {
  const rows = grid.length;
  if (rows === 0) return 0;
  const cols = (grid[0] as string[]).length;

  let islands = 0;
  const stack: number[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if ((grid[row] as string[])[col] !== '1') continue;

      islands += 1;
      // Encode each cell as a single number so the stack stays a flat array of primitives.
      stack.push(row * cols + col);
      (grid[row] as string[])[col] = '0';

      while (stack.length > 0) {
        const cell = stack.pop() as number;
        const r = Math.floor(cell / cols);
        const c = cell % cols;

        if (r > 0 && (grid[r - 1] as string[])[c] === '1') {
          (grid[r - 1] as string[])[c] = '0';
          stack.push((r - 1) * cols + c);
        }
        if (r + 1 < rows && (grid[r + 1] as string[])[c] === '1') {
          (grid[r + 1] as string[])[c] = '0';
          stack.push((r + 1) * cols + c);
        }
        if (c > 0 && (grid[r] as string[])[c - 1] === '1') {
          (grid[r] as string[])[c - 1] = '0';
          stack.push(r * cols + (c - 1));
        }
        if (c + 1 < cols && (grid[r] as string[])[c + 1] === '1') {
          (grid[r] as string[])[c + 1] = '0';
          stack.push(r * cols + (c + 1));
        }
      }
    }
  }

  return islands;
}
