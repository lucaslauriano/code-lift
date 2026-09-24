/**
 * Walk the bits from least significant to most significant, counting zeros only while we are
 * "inside" the number — that is, only after we have already seen a one.
 *
 * A gap is committed the moment the next one arrives, which is exactly what makes the trailing
 * zeros of a value like 32 never count: no closing one ever shows up.
 *
 * Time  O(log N) — one iteration per bit, at most 31 of them.
 * Space O(1).
 */
export function solution(n: number): number {
  let longest = 0;
  let current = 0;
  let seenOne = false;
  let rest = n;

  while (rest > 0) {
    const bit = rest & 1;
    rest >>>= 1;

    if (bit === 1) {
      if (seenOne && current > longest) longest = current;
      seenOne = true;
      current = 0;
    } else if (seenOne) {
      current += 1;
    }
  }

  return longest;
}
