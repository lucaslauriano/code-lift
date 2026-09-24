import { describe, expect, it } from 'vitest';
import { deepCloneInput } from './clone';

/** A right-leaning chain, the shape a linked list or a degenerate tree takes. */
function chain(length: number): { val: number; next: unknown } {
  let head: unknown = null;
  for (let i = length; i >= 1; i -= 1) head = { val: i, next: head };
  return head as { val: number; next: unknown };
}

describe('deepCloneInput', () => {
  it('passes primitives through untouched', () => {
    expect(deepCloneInput(42)).toBe(42);
    expect(deepCloneInput('x')).toBe('x');
    expect(deepCloneInput(null)).toBeNull();
    expect(deepCloneInput(undefined)).toBeUndefined();
  });

  it('copies arrays and objects rather than sharing them', () => {
    const source = { a: [1, 2, { b: 3 }] };
    const copy = deepCloneInput(source) as typeof source;

    expect(copy).toEqual(source);
    expect(copy).not.toBe(source);
    expect(copy.a).not.toBe(source.a);
    expect(copy.a[2]).not.toBe(source.a[2]);
  });

  it('copies Map, Set, Date, RegExp and typed arrays', () => {
    const source = {
      map: new Map([['k', { v: 1 }]]),
      set: new Set([1, 2]),
      date: new Date(1234),
      regexp: /ab+/gi,
      typed: new Int32Array([1, 2, 3]),
    };
    const copy = deepCloneInput(source) as typeof source;

    expect(copy).toEqual(source);
    expect(copy.map).not.toBe(source.map);
    expect(copy.map.get('k')).not.toBe(source.map.get('k'));
    expect(copy.typed).not.toBe(source.typed);
  });

  /**
   * The reason this module exists. structuredClone recurses internally and gives up around two
   * thousand levels — shallower than the call stack a plain recursive solution survives, which made
   * the harness, not the submission, the thing that failed on a deep input.
   */
  it('clones a structure far deeper than structuredClone can handle', () => {
    const deep = chain(100_000);

    let structuredCloneFailed = false;
    try {
      structuredClone(deep);
    } catch (error) {
      structuredCloneFailed = error instanceof RangeError;
    }
    expect(structuredCloneFailed).toBe(true);

    const copy = deepCloneInput(deep) as { val: number; next: unknown };

    // Assertions carry scalars only. Handing a 100k-deep object to a matcher makes Vitest walk it
    // to build a diff preview, and that walk overflows the stack — the same wall this clone exists
    // to get around.
    expect(copy === deep).toBe(false);

    let node: { val: number; next: unknown } | null = copy;
    let count = 0;
    while (node !== null) {
      count += 1;
      node = node.next as { val: number; next: unknown } | null;
    }
    expect(count).toBe(100_000);
  });

  it('keeps a deep clone independent of the original', () => {
    const deep = chain(5_000);
    const copy = deepCloneInput(deep) as { val: number; next: { val: number } };
    copy.next.val = -1;
    expect((deep.next as { val: number }).val).toBe(2);
  });

  it('survives a cycle', () => {
    const source: Record<string, unknown> = { name: 'a' };
    source['self'] = source;

    const copy = deepCloneInput(source) as Record<string, unknown>;
    expect(copy['name']).toBe('a');
    expect(copy['self']).toBe(copy);
  });
});
