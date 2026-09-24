/**
 * A stack is the whole answer: push every opener, and on a closer check that the top of the stack is
 * its matching opener. Anything else — a mismatch, or a closer with nothing open — means the string
 * is not properly nested, and we can stop immediately.
 *
 * At the end the stack must be empty; leftovers are openers that were never closed.
 *
 * Time  O(N) — one character, one push or one pop.
 * Space O(N) — worst case "(((((…", where every character is an opener.
 */
const CLOSERS = new Map<string, string>([
  [')', '('],
  [']', '['],
  ['}', '{'],
]);

export function solution(s: string): number {
  const stack: string[] = [];

  for (const character of s) {
    const expectedOpener = CLOSERS.get(character);

    if (expectedOpener === undefined) {
      stack.push(character);
      continue;
    }

    if (stack.pop() !== expectedOpener) return 0;
  }

  return stack.length === 0 ? 1 : 0;
}
