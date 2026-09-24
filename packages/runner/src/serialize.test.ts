import { describe, expect, it } from 'vitest';
import { serializeError, serializeValue } from './serialize';

describe('serializeValue', () => {
  it('never dumps a whole performance-sized array', () => {
    const text = serializeValue(Array.from({ length: 100_000 }, (_, i) => i));
    expect(text.length).toBeLessThan(2_200);
    expect(text).toContain('100000 total');
  });

  it('distinguishes -0 from 0 in the display, even though they compare equal', () => {
    expect(serializeValue(-0)).toBe('-0');
    expect(serializeValue(0)).toBe('0');
  });

  it('marks circular references instead of recursing forever', () => {
    const value: Record<string, unknown> = { a: 1 };
    value['self'] = value;
    expect(serializeValue(value)).toContain('[Circular]');
  });

  it('quotes strings so an empty string is visible', () => {
    expect(serializeValue('')).toBe('""');
    expect(serializeValue(undefined)).toBe('undefined');
    expect(serializeValue(null)).toBe('null');
  });
});

describe('serializeError', () => {
  it('keeps the name and message', () => {
    expect(serializeError(new TypeError('boom'))).toContain('TypeError: boom');
  });

  it('handles a thrown non-Error', () => {
    expect(serializeError('nope')).toBe('Thrown value: "nope"');
  });
});
