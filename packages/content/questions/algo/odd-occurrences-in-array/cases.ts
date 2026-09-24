import type { TestCase } from '@code-lift/shared';

/**
 * Pairs 1..(pairs) twice, plus one unpaired value at the end, shuffled deterministically so the
 * twins are not adjacent. The answer is known by construction — no second implementation involved.
 */
function buildPaired(pairs: number, unpaired: number): number[] {
  const values: number[] = [];
  for (let i = 1; i <= pairs; i += 1) values.push(i, i);
  values.push(unpaired);

  // Deterministic shuffle (xorshift-ish): the point is only to separate the twins.
  let seed = 123456789;
  for (let i = values.length - 1; i > 0; i -= 1) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    const tmp = values[i] as number;
    values[i] = values[j] as number;
    values[j] = tmp;
  }
  return values;
}

export const cases: TestCase[] = [
  // ---- public -------------------------------------------------------------
  { name: 'the statement example', input: [[9, 3, 9, 3, 9, 7, 9]], expected: 7 },
  { name: 'single element', input: [[42]], expected: 42 },
  { name: 'unpaired at the end', input: [[1, 1, 2]], expected: 2 },
  { name: 'unpaired at the start', input: [[2, 1, 1]], expected: 2 },
  { name: 'unpaired in the middle', input: [[1, 5, 1]], expected: 5 },
  { name: 'twins far apart', input: [[4, 7, 9, 7, 4]], expected: 9 },

  // ---- hidden -------------------------------------------------------------
  {
    name: 'largest allowed value, unpaired',
    input: [[1000000000]],
    expected: 1000000000,
    hidden: true,
  },
  {
    name: 'large values paired around a small one',
    input: [[999999937, 1, 999999937]],
    expected: 1,
    hidden: true,
  },
  { name: 'many pairs, unpaired first', input: [[8, 1, 1, 2, 2, 3, 3]], expected: 8, hidden: true },
  { name: 'many pairs, unpaired last', input: [[1, 1, 2, 2, 3, 3, 8]], expected: 8, hidden: true },
  { name: 'value 1 is the unpaired one', input: [[1, 2, 2, 3, 3]], expected: 1, hidden: true },
  { name: 'interleaved pairs', input: [[1, 2, 1, 3, 2, 3, 5]], expected: 5, hidden: true },
  {
    name: 'a value appearing four times still cancels',
    input: [[6, 6, 6, 6, 11]],
    expected: 11,
    hidden: true,
  },
  {
    name: 'nine elements',
    input: [[10, 20, 30, 20, 40, 30, 10, 40, 50]],
    expected: 50,
    hidden: true,
  },

  // ---- performance --------------------------------------------------------
  // ~100k elements. A nested "count how many times each value occurs" loop is O(N^2) and stalls.
  {
    name: '99,999 elements, unpaired is 50000',
    input: [buildPaired(49_999, 50_000)],
    expected: 50_000,
    hidden: true,
    perf: true,
  },
  {
    name: '100,001 elements, unpaired is a large value',
    input: [buildPaired(50_000, 999_999_999)],
    expected: 999_999_999,
    hidden: true,
    perf: true,
  },
];
