/**
 * Structural comparison used to decide whether a case passed.
 *
 * Two deliberate departures from `===`:
 *   - `NaN` equals `NaN`, because a solution that legitimately returns NaN should pass.
 *   - `0` equals `-0`, because producing `-0` is an artefact of arithmetic, not a wrong answer.
 *
 * Plain-object key order is irrelevant; array order is not.
 *
 * Iterative rather than recursive: a linked list of 100,000 nodes is a 100,000-deep object graph,
 * and recursing through it overflows the stack. Comparing a result against its expected value must
 * never be the thing that fails.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  const pending: [unknown, unknown][] = [[a, b]];
  /** Pairs already accepted, which is what makes a cyclic structure terminate. */
  const accepted = new WeakMap<object, WeakSet<object>>();

  while (pending.length > 0) {
    const [left, right] = pending.pop() as [unknown, unknown];
    if (!step(left, right, pending, accepted)) return false;
  }

  return true;
}

type Pending = [unknown, unknown][];
type Accepted = WeakMap<object, WeakSet<object>>;

/** Compares one pair, queueing any children that still have to match. */
function step(a: unknown, b: unknown, pending: Pending, accepted: Accepted): boolean {
  if (a === b) return true;

  if (typeof a === 'number' && typeof b === 'number') {
    // The only pair `===` misses that we want to accept.
    return Number.isNaN(a) && Number.isNaN(b);
  }

  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;

  const left = a as object;
  const right = b as object;

  // A pair seen before is assumed equal; if it is not, some other pair in the queue says so.
  const partners = accepted.get(left);
  if (partners?.has(right)) return true;
  if (partners) partners.add(right);
  else accepted.set(left, new WeakSet([right]));

  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
    for (let i = 0; i < left.length; i += 1) pending.push([left[i], right[i]]);
    return true;
  }

  if (left instanceof Date || right instanceof Date) {
    return (
      left instanceof Date && right instanceof Date && Object.is(left.getTime(), right.getTime())
    );
  }

  if (left instanceof RegExp || right instanceof RegExp) {
    return (
      left instanceof RegExp &&
      right instanceof RegExp &&
      left.source === right.source &&
      left.flags === right.flags
    );
  }

  if (left instanceof Map || right instanceof Map) {
    if (!(left instanceof Map) || !(right instanceof Map) || left.size !== right.size) return false;
    for (const [key, value] of left) {
      if (!right.has(key)) return false;
      pending.push([value, right.get(key)]);
    }
    return true;
  }

  if (left instanceof Set || right instanceof Set) {
    if (!(left instanceof Set) || !(right instanceof Set) || left.size !== right.size) return false;
    // Sets of primitives are the common case; fall back to O(n^2) only for object members. The
    // nested call is itself iterative, so depth is still not a problem.
    for (const value of left) {
      if (right.has(value)) continue;
      let matched = false;
      for (const candidate of right) {
        if (deepEqual(value, candidate)) {
          matched = true;
          break;
        }
      }
      if (!matched) return false;
    }
    return true;
  }

  if (ArrayBuffer.isView(left) || ArrayBuffer.isView(right)) {
    if (!ArrayBuffer.isView(left) || !ArrayBuffer.isView(right)) return false;
    if (left.constructor !== right.constructor || left.byteLength !== right.byteLength)
      return false;
    const leftBytes = new Uint8Array(left.buffer, left.byteOffset, left.byteLength);
    const rightBytes = new Uint8Array(right.buffer, right.byteOffset, right.byteLength);
    return leftBytes.every((byte, index) => byte === rightBytes[index]);
  }

  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const keys = Object.keys(leftRecord);
  if (keys.length !== Object.keys(rightRecord).length) return false;

  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(rightRecord, key)) return false;
    pending.push([leftRecord[key], rightRecord[key]]);
  }

  return true;
}
