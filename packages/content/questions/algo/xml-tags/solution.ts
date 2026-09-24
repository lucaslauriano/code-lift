/**
 * A stack, plus a count of what is open per name.
 *
 * The count is what keeps this linear. On a closing tag the first question is "is this name open at
 * all?" — answering that by searching the stack would be O(depth) per tag and O(N^2) overall, while
 * a map answers it in O(1). Once the name is known to be somewhere in the stack, popping down to it
 * is amortised O(1): across the whole string every tag is pushed once and popped once.
 *
 * Time  O(N).
 * Space O(N) — the stack, in the worst case of fully nested input.
 */
export function solution(s: string): number {
  const stack: string[] = [];
  const openPerName = new Map<string, number>();
  let missing = 0;

  for (let i = 0; i < s.length; i += 1) {
    if (s[i] !== '<') continue;

    const closing = s[i + 1] === '/';
    const start = closing ? i + 2 : i + 1;
    const end = s.indexOf('>', start);
    if (end === -1) break;
    const name = s.slice(start, end);
    i = end;

    if (!closing) {
      stack.push(name);
      openPerName.set(name, (openPerName.get(name) ?? 0) + 1);
      continue;
    }

    if ((openPerName.get(name) ?? 0) === 0) {
      // Nothing to close: this tag needs an opening of its own.
      missing += 1;
      continue;
    }

    // Unwind to the matching opening. Everything skipped was left unclosed.
    for (;;) {
      const top = stack.pop() as string;
      openPerName.set(top, (openPerName.get(top) as number) - 1);
      if (top === name) break;
      missing += 1;
    }
  }

  // Whatever is still open needs a closing tag.
  return missing + stack.length;
}
