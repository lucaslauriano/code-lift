/**
 * Per tag name, two counters that never cancel each other.
 *
 * A closing tag arriving with nothing open cannot be fixed by an opening tag that shows up later —
 * that one is already spoken for by its own closing. So the fixes are tallied separately: closings
 * that found nothing open need an opening prepended, and whatever is still open at the end needs a
 * closing appended.
 *
 * This is the whole difference from the simpler version of the problem, where extra closings are
 * ignored rather than repaired.
 *
 * Time  O(N).
 * Space O(K) for K distinct tag names.
 */
export function solution(s: string): number {
  /** Currently open, per name. */
  const open = new Map<string, number>();
  let missingOpenings = 0;

  for (let i = 0; i < s.length; i += 1) {
    if (s[i] !== '<') continue;

    const closing = s[i + 1] === '/';
    const start = closing ? i + 2 : i + 1;
    const end = s.indexOf('>', start);
    if (end === -1) break;
    const name = s.slice(start, end);
    i = end;

    if (!closing) {
      open.set(name, (open.get(name) ?? 0) + 1);
      continue;
    }

    const depth = open.get(name) ?? 0;
    if (depth > 0) open.set(name, depth - 1);
    else missingOpenings += 1;
  }

  let missingClosings = 0;
  for (const depth of open.values()) missingClosings += depth;

  return missingOpenings + missingClosings;
}
