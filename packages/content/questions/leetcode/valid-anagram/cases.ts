import type { TestCase } from '@code-lift/shared';

const N = 100_000;

/** 100k characters cycling through the alphabet, and the same multiset shuffled deterministically. */
const source = Array.from({ length: N }, (_, i) => String.fromCharCode(97 + (i % 26)));
const shuffled = (() => {
  const chars = [...source];
  let seed = 987654321;
  for (let i = chars.length - 1; i > 0; i -= 1) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    const tmp = chars[i] as string;
    chars[i] = chars[j] as string;
    chars[j] = tmp;
  }
  return chars.join('');
})();
const original = source.join('');

/** Same length, one letter different, and that letter sits at the very end. */
const almost = `${original.slice(0, N - 1)}${original[N - 1] === 'a' ? 'b' : 'a'}`;

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'a classic anagram', input: ['anagram', 'nagaram'], expected: true },
  { name: 'same letters, different counts', input: ['rat', 'car'], expected: false },
  { name: 'different lengths', input: ['a', 'ab'], expected: false },
  { name: 'both empty', input: ['', ''], expected: true },
  { name: 'identical strings', input: ['abc', 'abc'], expected: true },
  { name: 'one letter each, different', input: ['a', 'b'], expected: false },

  // ---- hidden -------------------------------------------------------------
  {
    name: 'repeated letters in different amounts',
    input: ['aacc', 'ccac'],
    expected: false,
    hidden: true,
  },
  { name: 'one empty, one not', input: ['', 'a'], expected: false, hidden: true },
  { name: 'the same letter repeated', input: ['aaaa', 'aaaa'], expected: true, hidden: true },
  { name: 'reversed', input: ['abcdef', 'fedcba'], expected: true, hidden: true },
  { name: 'a single swap breaks it', input: ['abcd', 'abce'], expected: false, hidden: true },
  {
    name: 'all 26 letters',
    input: ['abcdefghijklmnopqrstuvwxyz', 'zyxwvutsrqponmlkjihgfedcba'],
    expected: true,
    hidden: true,
  },
  { name: 'same letters, one extra copy', input: ['aab', 'abb'], expected: false, hidden: true },
  { name: 'long but simple', input: ['aaaaabbbbb', 'bbbbbaaaaa'], expected: true, hidden: true },

  // ---- performance --------------------------------------------------------
  // 100k characters. Sorting both strings is O(N log N) and passes; removing matched characters
  // with splice or replace inside a loop is O(N^2) and does not.
  {
    name: '100k characters, shuffled anagram',
    input: [original, shuffled],
    expected: true,
    hidden: true,
    perf: true,
  },
  {
    name: '100k characters differing only at the end',
    input: [original, almost],
    expected: false,
    hidden: true,
    perf: true,
  },
];
