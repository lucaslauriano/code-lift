/**
 * Count letters in one string, spend them on the other.
 *
 * The length check first is not an optimisation detail — it is what makes a single tally enough. If
 * the lengths match and no count ever goes negative while consuming `t`, then every count must have
 * landed exactly on zero, so a second pass to verify is unnecessary.
 *
 * The alphabet is 26 letters, so a fixed array beats a Map: no hashing, no allocation per key.
 *
 * Time  O(N).
 * Space O(1) — 26 slots regardless of input size.
 */
const ALPHABET = 26;
const CODE_A = 97;

export function solution(s: string, t: string): boolean {
  if (s.length !== t.length) return false;

  const counts = new Int32Array(ALPHABET);
  for (let i = 0; i < s.length; i += 1) {
    const index = s.charCodeAt(i) - CODE_A;
    counts[index] = (counts[index] as number) + 1;
  }

  for (let i = 0; i < t.length; i += 1) {
    const index = t.charCodeAt(i) - CODE_A;
    const remaining = (counts[index] as number) - 1;
    if (remaining < 0) return false;
    counts[index] = remaining;
  }

  return true;
}
