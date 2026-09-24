import type { TestCase } from '@code-lift/shared';

/** Turns a compact row notation into the grid of '0'/'1' strings the problem uses. */
function grid(rows: readonly string[]): string[][] {
  return rows.map((row) => [...row]);
}

const SIDE = 300;

/** Every cell is land: one island of 90,000 cells, and 90,000 deep for a recursive fill. */
const allLand = Array.from({ length: SIDE }, () => new Array<string>(SIDE).fill('1'));

/**
 * A checkerboard: land only where row + col is even. Diagonals do not connect, so every land cell
 * is its own island — 45,000 of them.
 */
const checkerboard = Array.from({ length: SIDE }, (_, row) =>
  Array.from({ length: SIDE }, (_, col) => ((row + col) % 2 === 0 ? '1' : '0')),
);
const checkerboardIslands = Math.ceil((SIDE * SIDE) / 2);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  {
    name: 'one large island',
    input: [grid(['11110', '11010', '11000', '00000'])],
    expected: 1,
  },
  {
    name: 'three islands',
    input: [grid(['11000', '11000', '00100', '00011'])],
    expected: 3,
  },
  { name: 'all water', input: [grid(['000', '000'])], expected: 0 },
  { name: 'a single land cell', input: [grid(['1'])], expected: 1 },
  { name: 'a single water cell', input: [grid(['0'])], expected: 0 },
  { name: 'one row, two islands', input: [grid(['101'])], expected: 2 },

  // ---- hidden -------------------------------------------------------------
  { name: 'diagonals do not connect', input: [grid(['10', '01'])], expected: 2, hidden: true },
  { name: 'a vertical strip', input: [grid(['1', '1', '1'])], expected: 1, hidden: true },
  {
    name: 'islands touching the border',
    input: [grid(['1001', '0000', '1001'])],
    expected: 4,
    hidden: true,
  },
  {
    name: 'a ring of land around water',
    input: [grid(['111', '101', '111'])],
    expected: 1,
    hidden: true,
  },
  {
    name: 'a spiral that is still one island',
    input: [grid(['11111', '00001', '11101', '10001', '11111'])],
    expected: 1,
    hidden: true,
  },
  {
    name: 'a single column of water splits the grid',
    input: [grid(['101', '101', '101'])],
    expected: 2,
    hidden: true,
  },
  { name: 'one tall column', input: [grid(['10', '10', '10', '11'])], expected: 1, hidden: true },
  {
    name: 'every cell is land in a small grid',
    input: [grid(['11', '11'])],
    expected: 1,
    hidden: true,
  },

  // ---- performance --------------------------------------------------------
  // 300x300, the stated maximum. All-land is a single 90,000-cell region, which is exactly the
  // depth a recursive flood fill cannot survive.
  { name: '300x300, entirely land', input: [allLand], expected: 1, hidden: true, perf: true },
  {
    name: '300x300 checkerboard, 45k islands',
    input: [checkerboard],
    expected: checkerboardIslands,
    hidden: true,
    perf: true,
  },
];
