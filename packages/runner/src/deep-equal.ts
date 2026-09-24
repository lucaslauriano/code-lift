/**
 * Structural comparison used to decide whether a case passed.
 *
 * Two deliberate departures from `===`:
 *   - `NaN` equals `NaN`, because a solution that legitimately returns NaN should pass.
 *   - `0` equals `-0`, because producing `-0` is an artefact of arithmetic, not a wrong answer.
 *
 * Plain-object key order is irrelevant; array order is not.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  return equal(a, b, new Set());
}

function equal(a: unknown, b: unknown, seen: Set<string>): boolean {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'number') {
    // The only pair `===` misses that we want to accept.
    return Number.isNaN(a) && Number.isNaN(b);
  }
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;

  // Cycle guard: a pair already on the stack is assumed equal; if it isn't, some other pair differs.
  const pairKey = keyFor(a, b, seen);
  if (pairKey === null) return true;

  try {
    if (Array.isArray(a) || Array.isArray(b)) {
      if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
      return a.every((item, index) => equal(item, b[index], seen));
    }

    if (a instanceof Date || b instanceof Date) {
      return a instanceof Date && b instanceof Date && Object.is(a.getTime(), b.getTime());
    }

    if (a instanceof RegExp || b instanceof RegExp) {
      return (
        a instanceof RegExp && b instanceof RegExp && a.source === b.source && a.flags === b.flags
      );
    }

    if (a instanceof Map || b instanceof Map) {
      if (!(a instanceof Map) || !(b instanceof Map) || a.size !== b.size) return false;
      for (const [key, value] of a) {
        if (!b.has(key)) return false;
        if (!equal(value, b.get(key), seen)) return false;
      }
      return true;
    }

    if (a instanceof Set || b instanceof Set) {
      if (!(a instanceof Set) || !(b instanceof Set) || a.size !== b.size) return false;
      // Sets of primitives are the common case; fall back to O(n^2) only for object members.
      for (const value of a) {
        if (b.has(value)) continue;
        let matched = false;
        for (const candidate of b) {
          if (equal(value, candidate, seen)) {
            matched = true;
            break;
          }
        }
        if (!matched) return false;
      }
      return true;
    }

    if (ArrayBuffer.isView(a) || ArrayBuffer.isView(b)) {
      if (!ArrayBuffer.isView(a) || !ArrayBuffer.isView(b)) return false;
      if (a.constructor !== b.constructor || a.byteLength !== b.byteLength) return false;
      const left = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
      const right = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
      return left.every((byte, index) => byte === right[index]);
    }

    const aKeys = Object.keys(a as Record<string, unknown>);
    const bKeys = Object.keys(b as Record<string, unknown>);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(b, key) &&
        equal((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], seen),
    );
  } finally {
    if (pairKey !== null) seen.delete(pairKey);
  }
}

const ids = new WeakMap<object, number>();
let nextId = 0;

/** Returns null when the pair is already being compared higher up the stack. */
function keyFor(a: object, b: object, seen: Set<string>): string | null {
  const key = `${idOf(a)}:${idOf(b)}`;
  if (seen.has(key)) return null;
  seen.add(key);
  return key;
}

function idOf(value: object): number {
  const existing = ids.get(value);
  if (existing !== undefined) return existing;
  nextId += 1;
  ids.set(value, nextId);
  return nextId;
}
