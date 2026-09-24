/**
 * A counter is enough — no stack.
 *
 * Because tag names are irrelevant and stray closings are ignored, the only state worth keeping is
 * "how many tags are open right now". Clamping at zero is what implements "ignored": a closing tag
 * with nothing open leaves the count where it was instead of driving it negative.
 *
 * Time  O(N) — one scan of the string.
 * Space O(1) — one integer, whatever the log size.
 */
export function solution(s: string): number {
  let open = 0;

  for (let i = 0; i < s.length; i += 1) {
    if (s[i] !== '<') continue;

    if (s[i + 1] === '/') {
      if (open > 0) open -= 1;
    } else {
      open += 1;
    }
  }

  return open;
}
