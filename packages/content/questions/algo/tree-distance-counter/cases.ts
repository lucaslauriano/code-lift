import type { TestCase } from '@code-lift/shared';

const N = 100_000;

/**
 * A path: capital at 0, every city hanging off the previous one.
 * Exactly one city at each distance 1..N-1, so the answer is N-1 ones.
 */
function path(length: number): { input: number[]; expected: number[] } {
  const t = Array.from({ length }, (_, i) => (i === 0 ? 0 : i - 1));
  return { input: t, expected: new Array<number>(length - 1).fill(1) };
}

/**
 * A star: the capital plus N-1 cities all one road away.
 * Every city is at distance 1, so the answer is a single bucket.
 */
function star(length: number): { input: number[]; expected: number[] } {
  const t = new Array<number>(length).fill(0);
  return { input: t, expected: [length - 1] };
}

const deepPath = path(N);
const wideStar = star(N);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'the worked example', input: [[9, 1, 4, 9, 0, 4, 8, 9, 0, 1]], expected: [1, 3, 2, 3] },
  { name: 'a single city', input: [[0]], expected: [] },
  { name: 'a path of four', input: [[0, 0, 1, 2]], expected: [1, 1, 1] },
  { name: 'a star of five', input: [[2, 2, 2, 2, 2]], expected: [4] },
  { name: 'two cities', input: [[1, 1]], expected: [1] },
  { name: 'the capital is not city zero', input: [[1, 1, 1]], expected: [2] },

  // ---- hidden -------------------------------------------------------------
  { name: 'a path of three from the far end', input: [[1, 2, 2]], expected: [1, 1], hidden: true },
  {
    name: 'a balanced binary tree of seven',
    input: [[0, 0, 0, 1, 1, 2, 2]],
    expected: [2, 4],
    hidden: true,
  },
  {
    name: 'a capital with one long branch',
    input: [[0, 0, 1, 2, 3]],
    expected: [1, 1, 1, 1],
    hidden: true,
  },
  {
    name: 'two branches of different lengths',
    input: [[0, 0, 1, 0, 3, 4]],
    expected: [2, 2, 1],
    hidden: true,
  },
  {
    name: 'the capital is the last city',
    input: [[1, 2, 3, 3]],
    expected: [1, 1, 1],
    hidden: true,
  },
  {
    name: 'a wide level then a narrow one',
    input: [[0, 0, 0, 0, 1]],
    expected: [3, 1],
    hidden: true,
  },
  { name: 'a path of six', input: [[0, 0, 1, 2, 3, 4]], expected: [1, 1, 1, 1, 1], hidden: true },
  { name: 'a star of ten', input: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], expected: [9], hidden: true },

  // ---- performance --------------------------------------------------------
  // 100k cities. The path is the deepest possible tree, which is where a recursive traversal blows
  // the stack; the star is the widest, which is where a per-node adjacency scan goes quadratic.
  {
    name: '100k cities in a single path',
    input: [deepPath.input],
    expected: deepPath.expected,
    hidden: true,
    perf: true,
  },
  {
    name: '100k cities all attached to the capital',
    input: [wideStar.input],
    expected: wideStar.expected,
    hidden: true,
    perf: true,
  },
];
