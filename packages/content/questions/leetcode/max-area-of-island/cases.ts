import type { TestCase } from '@code-lift/shared';

/** Compact row notation into the numeric grid the problem uses. */
function grid(rows: readonly string[]): number[][] {
  return rows.map((row) => [...row].map((cell) => (cell === '1' ? 1 : 0)));
}

const SIDE = 300;

/** Solid land: one region of 90,000 cells. */
const allLand = Array.from({ length: SIDE }, () => new Array<number>(SIDE).fill(1));

/** Checkerboard: no two land cells touch, so the largest island is a single cell. */
const checkerboard = Array.from({ length: SIDE }, (_, row) =>
  Array.from({ length: SIDE }, (_, col) => ((row + col) % 2 === 0 ? 1 : 0)),
);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'the worked example', input: [grid(['00100', '00000', '01100', '01000'])], expected: 3 },
  { name: 'no land at all', input: [grid(['000', '000'])], expected: 0 },
  { name: 'a single land cell', input: [grid(['1'])], expected: 1 },
  { name: 'a single water cell', input: [grid(['0'])], expected: 0 },
  { name: 'the whole grid is one island', input: [grid(['11', '11'])], expected: 4 },
  { name: 'the largest of two', input: [grid(['110', '000', '001'])], expected: 2 },

  // ---- hidden -------------------------------------------------------------
  { name: 'diagonals do not join', input: [grid(['10', '01'])], expected: 1, hidden: true },
  { name: 'a long horizontal strip', input: [grid(['11111'])], expected: 5, hidden: true },
  { name: 'a long vertical strip', input: [grid(['1', '1', '1', '1'])], expected: 4, hidden: true },
  {
    name: 'the smaller island comes first',
    input: [grid(['10011', '00011'])],
    expected: 4,
    hidden: true,
  },
  { name: 'an L shape', input: [grid(['100', '100', '111'])], expected: 5, hidden: true },
  {
    name: 'a ring counts only its land',
    input: [grid(['111', '101', '111'])],
    expected: 8,
    hidden: true,
  },
  {
    name: 'two islands of equal size',
    input: [grid(['110', '000', '110'])],
    expected: 2,
    hidden: true,
  },
  {
    name: 'land only on the border row',
    input: [grid(['000', '000', '111'])],
    expected: 3,
    hidden: true,
  },

  // ---- performance --------------------------------------------------------
  // 300x300, the stated maximum. Solid land is one 90,000-cell region — the depth a recursive fill
  // cannot survive. The checkerboard is 45,000 separate fills instead of one big one.
  {
    name: '300x300, entirely land',
    input: [allLand],
    expected: SIDE * SIDE,
    hidden: true,
    perf: true,
  },
  {
    name: '300x300 checkerboard, every island is one cell',
    input: [checkerboard],
    expected: 1,
    hidden: true,
    perf: true,
  },
];
