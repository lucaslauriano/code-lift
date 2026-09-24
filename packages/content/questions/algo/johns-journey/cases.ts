import type { TestCase } from '@code-lift/shared';

const N = 100_000;

/** Distinct IDs in a range that does not collide with the other countries. */
function distinctCities(count: number, offset: number): number[] {
  return Array.from({ length: count }, (_, i) => offset + i);
}

/** The same city repeated — many entries, one choice. */
function oneCity(count: number, id: number): number[] {
  return new Array<number>(count).fill(id);
}

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  {
    name: 'the worked example',
    input: [
      [2, 1, 1],
      [4, 4],
      [5, 6],
    ],
    expected: 4,
  },
  { name: 'all distinct', input: [[1, 2, 3], [4, 5], [6]], expected: 6 },
  { name: 'one country offers a single city', input: [[1, 1, 1], [2], [3]], expected: 1 },
  { name: 'one city each', input: [[1], [2], [3]], expected: 1 },
  {
    name: 'duplicates on both sides',
    input: [
      [1, 1],
      [2, 2],
      [3, 3],
    ],
    expected: 1,
  },
  {
    name: 'two by two by two',
    input: [
      [1, 2],
      [3, 4],
      [5, 6],
    ],
    expected: 8,
  },

  // ---- hidden -------------------------------------------------------------
  {
    name: 'duplicates interleaved',
    input: [[1, 2, 1, 2, 3], [4, 4, 5], [6]],
    expected: 6,
    hidden: true,
  },
  { name: 'one country dominates', input: [[1, 2, 3, 4, 5], [6], [7]], expected: 5, hidden: true },
  { name: 'large IDs', input: [[1000000000, 999999999], [5], [6]], expected: 2, hidden: true },
  {
    name: 'every entry repeated many times',
    input: [
      [1, 1, 1, 1],
      [2, 2, 2],
      [3, 3],
    ],
    expected: 1,
    hidden: true,
  },
  {
    name: 'ten by ten by ten',
    input: [distinctCities(10, 1), distinctCities(10, 100), distinctCities(10, 200)],
    expected: 1000,
    hidden: true,
  },
  {
    name: 'exactly at the limit',
    input: [distinctCities(1000, 1), distinctCities(1000, 10000), distinctCities(1000, 100000)],
    expected: 1000000000,
    hidden: true,
  },
  {
    name: 'one over the limit',
    input: [distinctCities(1001, 1), distinctCities(1000, 10000), distinctCities(1000, 100000)],
    expected: -1,
    hidden: true,
  },
  { name: 'unsorted input', input: [[9, 3, 9], [7, 1], [5]], expected: 4, hidden: true },

  // ---- performance --------------------------------------------------------
  // 300k entries in total. A nested "have I counted this city already?" scan is O(N^2).
  {
    name: '100k distinct cities per country, well over the limit',
    input: [distinctCities(N, 1), distinctCities(N, 1_000_000), distinctCities(N, 2_000_000)],
    expected: -1,
    hidden: true,
    perf: true,
  },
  {
    name: '100k entries per country but one city each',
    input: [oneCity(N, 1), oneCity(N, 2), oneCity(N, 3)],
    expected: 1,
    hidden: true,
    perf: true,
  },
];
