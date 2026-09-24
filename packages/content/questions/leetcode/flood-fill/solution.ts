/**
 * Flood fill with an explicit stack.
 *
 * The guard that matters is the first line of the body: if the new colour already equals the
 * starting colour, there is nothing to do. Without it, every repainted pixel still matches the
 * colour being looked for, so its neighbours keep qualifying and the fill never terminates.
 *
 * Iterative because a 300x300 image of a single colour is a 90,000-pixel region, which a recursive
 * fill is too deep to survive.
 *
 * Time  O(R * C).
 * Space O(R * C).
 */
export function solution(image: number[][], sr: number, sc: number, colour: number): number[][] {
  const rows = image.length;
  const cols = (image[0] as number[]).length;
  const original = (image[sr] as number[])[sc] as number;

  if (original === colour) return image;

  const stack: number[] = [sr * cols + sc];
  (image[sr] as number[])[sc] = colour;

  while (stack.length > 0) {
    const cell = stack.pop() as number;
    const r = Math.floor(cell / cols);
    const c = cell % cols;

    if (r > 0 && (image[r - 1] as number[])[c] === original) {
      (image[r - 1] as number[])[c] = colour;
      stack.push((r - 1) * cols + c);
    }
    if (r + 1 < rows && (image[r + 1] as number[])[c] === original) {
      (image[r + 1] as number[])[c] = colour;
      stack.push((r + 1) * cols + c);
    }
    if (c > 0 && (image[r] as number[])[c - 1] === original) {
      (image[r] as number[])[c - 1] = colour;
      stack.push(r * cols + (c - 1));
    }
    if (c + 1 < cols && (image[r] as number[])[c + 1] === original) {
      (image[r] as number[])[c + 1] = colour;
      stack.push(r * cols + (c + 1));
    }
  }

  return image;
}
