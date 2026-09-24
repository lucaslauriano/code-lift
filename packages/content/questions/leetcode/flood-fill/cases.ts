import type { TestCase } from '@code-lift/shared';

const SIDE = 300;

/** A uniform image: the fill covers all 90,000 pixels in one region. */
function uniform(value: number): number[][] {
  return Array.from({ length: SIDE }, () => new Array<number>(SIDE).fill(value));
}

/** A spiral-free worst case: every column alternates, so the fill is one long snake. */
const striped = Array.from({ length: SIDE }, (_, row) =>
  Array.from({ length: SIDE }, (_, col) => (col % 2 === 0 || row === 0 ? 1 : 0)),
);
const stripedFilled = Array.from({ length: SIDE }, (_, row) =>
  Array.from({ length: SIDE }, (_, col) => (col % 2 === 0 || row === 0 ? 9 : 0)),
);

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  {
    name: 'the worked example',
    input: [
      [
        [1, 1, 1],
        [1, 1, 0],
        [1, 0, 1],
      ],
      1,
      1,
      2,
    ],
    expected: [
      [2, 2, 2],
      [2, 2, 0],
      [2, 0, 1],
    ],
  },
  {
    name: 'the new colour already matches, so nothing changes',
    input: [
      [
        [0, 0, 0],
        [0, 0, 0],
      ],
      0,
      0,
      0,
    ],
    expected: [
      [0, 0, 0],
      [0, 0, 0],
    ],
  },
  { name: 'a single pixel', input: [[[1]], 0, 0, 2], expected: [[2]] },
  { name: 'a single pixel, same colour', input: [[[1]], 0, 0, 1], expected: [[1]] },
  { name: 'one row', input: [[[1, 1, 0, 1]], 0, 0, 5], expected: [[5, 5, 0, 1]] },
  { name: 'one column', input: [[[1], [1], [0]], 0, 0, 5], expected: [[5], [5], [0]] },

  // ---- hidden -------------------------------------------------------------
  {
    name: 'diagonals do not connect',
    input: [
      [
        [1, 0],
        [0, 1],
      ],
      0,
      0,
      2,
    ],
    expected: [
      [2, 0],
      [0, 1],
    ],
    hidden: true,
  },
  {
    name: 'starting on an isolated pixel',
    input: [
      [
        [1, 0, 1],
        [0, 0, 0],
      ],
      0,
      2,
      7,
    ],
    expected: [
      [1, 0, 7],
      [0, 0, 0],
    ],
    hidden: true,
  },
  {
    name: 'the whole image is one region',
    input: [
      [
        [3, 3],
        [3, 3],
      ],
      1,
      1,
      8,
    ],
    expected: [
      [8, 8],
      [8, 8],
    ],
    hidden: true,
  },
  {
    name: 'a region shaped like a ring is filled, the hole is not',
    input: [
      [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
      ],
      0,
      0,
      4,
    ],
    expected: [
      [4, 4, 4],
      [4, 0, 4],
      [4, 4, 4],
    ],
    hidden: true,
  },
  {
    name: 'starting inside the hole',
    input: [
      [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
      ],
      1,
      1,
      4,
    ],
    expected: [
      [1, 1, 1],
      [1, 4, 1],
      [1, 1, 1],
    ],
    hidden: true,
  },
  {
    name: 'a wall splits the image in two',
    input: [
      [
        [1, 0, 1],
        [1, 0, 1],
      ],
      0,
      0,
      6,
    ],
    expected: [
      [6, 0, 1],
      [6, 0, 1],
    ],
    hidden: true,
  },
  {
    name: 'colour zero is a real colour',
    input: [[[0, 1]], 0, 0, 3],
    expected: [[3, 1]],
    hidden: true,
  },
  {
    name: 'an L-shaped region',
    input: [
      [
        [2, 0],
        [2, 2],
      ],
      0,
      0,
      9,
    ],
    expected: [
      [9, 0],
      [9, 9],
    ],
    hidden: true,
  },

  // ---- performance --------------------------------------------------------
  // 300x300, the stated maximum. The uniform image is a single 90,000-pixel region, which is the
  // depth a recursive fill cannot survive.
  {
    name: '300x300, one uniform region',
    input: [uniform(1), 150, 150, 9],
    expected: uniform(9),
    hidden: true,
    perf: true,
  },
  {
    name: '300x300 stripes joined along the top row',
    input: [striped, 0, 0, 9],
    expected: stripedFilled,
    hidden: true,
    perf: true,
  },
];
