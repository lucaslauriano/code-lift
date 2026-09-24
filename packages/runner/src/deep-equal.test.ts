import { describe, expect, it } from 'vitest';
import { deepEqual } from './deep-equal';

describe('deepEqual', () => {
  it('treats NaN as equal to itself', () => {
    expect(deepEqual(NaN, NaN)).toBe(true);
    expect(deepEqual([NaN, 1], [NaN, 1])).toBe(true);
  });

  it('treats -0 and 0 as the same answer', () => {
    expect(deepEqual(-0, 0)).toBe(true);
  });

  it('keeps null and undefined distinct', () => {
    expect(deepEqual(null, undefined)).toBe(false);
  });

  it('compares arrays by order', () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2, 3], [3, 2, 1])).toBe(false);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it('ignores key order in plain objects', () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);
  });

  it('does not confuse an array with an object of numeric keys', () => {
    expect(deepEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);
  });

  it('compares nested structures', () => {
    expect(deepEqual({ a: [{ b: new Set([1, 2]) }] }, { a: [{ b: new Set([2, 1]) }] })).toBe(true);
    expect(deepEqual({ a: [{ b: new Set([1, 2]) }] }, { a: [{ b: new Set([1, 3]) }] })).toBe(false);
  });

  it('compares Maps by entry, ignoring insertion order', () => {
    expect(
      deepEqual(
        new Map([
          ['a', 1],
          ['b', 2],
        ]),
        new Map([
          ['b', 2],
          ['a', 1],
        ]),
      ),
    ).toBe(true);
  });

  it('compares Dates by instant and RegExps by source and flags', () => {
    expect(deepEqual(new Date(0), new Date(0))).toBe(true);
    expect(deepEqual(new Date(0), new Date(1))).toBe(false);
    expect(deepEqual(/a/gi, /a/gi)).toBe(true);
    expect(deepEqual(/a/g, /a/i)).toBe(false);
  });

  it('compares typed arrays by content and constructor', () => {
    expect(deepEqual(new Int32Array([1, 2]), new Int32Array([1, 2]))).toBe(true);
    expect(deepEqual(new Int32Array([1, 2]), new Uint8Array([1, 2]))).toBe(false);
  });

  it('survives cyclic structures instead of blowing the stack', () => {
    const left: Record<string, unknown> = { name: 'a' };
    const right: Record<string, unknown> = { name: 'a' };
    left['self'] = left;
    right['self'] = right;
    expect(deepEqual(left, right)).toBe(true);
  });

  it('handles the large arrays a performance case produces', () => {
    const a = Array.from({ length: 100_000 }, (_, i) => i);
    const b = Array.from({ length: 100_000 }, (_, i) => i);
    expect(deepEqual(a, b)).toBe(true);
    b[99_999] = -1;
    expect(deepEqual(a, b)).toBe(false);
  });
});

describe('deepEqual on deep structures', () => {
  /** A right-leaning chain, the shape a linked list takes. */
  function chain(length: number, tweakLast?: number): { val: number; next: unknown } {
    let head: unknown = null;
    for (let i = length; i >= 1; i -= 1) {
      head = { val: i === length && tweakLast !== undefined ? tweakLast : i, next: head };
    }
    return head as { val: number; next: unknown };
  }

  it('compares two 100k-deep lists without exhausting the stack', () => {
    expect(deepEqual(chain(100_000), chain(100_000))).toBe(true);
  });

  it('still finds a difference at the far end of a deep list', () => {
    expect(deepEqual(chain(100_000), chain(100_000, -1))).toBe(false);
  });

  it('finds a length difference between deep lists', () => {
    expect(deepEqual(chain(100_000), chain(99_999))).toBe(false);
  });
});
