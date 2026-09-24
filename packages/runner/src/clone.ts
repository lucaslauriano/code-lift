/**
 * Deep-clones a test case input.
 *
 * `structuredClone` is the right tool and the fast path, but it recurses internally and gives up
 * around two thousand levels of nesting — shallower than the call stack a plain recursive solution
 * survives. That made the harness the binding constraint: a question could not ship a linked list
 * or a degenerate tree deep enough to be interesting, because cloning the input died before the
 * submission ran.
 *
 * So on RangeError we fall back to an iterative clone with an explicit work stack, which has no
 * depth limit at all.
 */
export function deepCloneInput(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;

  try {
    return structuredClone(value);
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return cloneIteratively(value);
  }
}

type Job = () => void;

/**
 * Breadth-ish clone driven by a queue of "fill this slot" jobs.
 *
 * Containers are created empty and their contents queued, so nothing is ever nested on the call
 * stack: depth becomes queue length, which is bounded by memory rather than by the stack.
 */
function cloneIteratively(root: object): unknown {
  const seen = new WeakMap<object, unknown>();
  const jobs: Job[] = [];

  const clone = (value: unknown, assign: (cloned: unknown) => void): void => {
    if (value === null || typeof value !== 'object') {
      assign(value);
      return;
    }

    const existing = seen.get(value);
    if (existing !== undefined) {
      assign(existing);
      return;
    }

    const source = value as object;
    const shell = emptyLike(source);

    // Dates, RegExps and typed arrays copy whole; nothing to walk into.
    if (shell.done) {
      seen.set(source, shell.value);
      assign(shell.value);
      return;
    }

    seen.set(source, shell.value);
    assign(shell.value);
    jobs.push(() => fill(source, shell.value, clone));
  };

  let result: unknown;
  clone(root, (cloned) => {
    result = cloned;
  });

  // Jobs append more jobs; the loop drains until the structure is complete.
  for (let i = 0; i < jobs.length; i += 1) (jobs[i] as Job)();

  return result;
}

/** Creates an empty container of the same shape, or the finished clone for leaf-like objects. */
function emptyLike(source: object): { value: unknown; done: boolean } {
  if (Array.isArray(source)) return { value: new Array<unknown>(source.length), done: false };
  if (source instanceof Date) return { value: new Date(source.getTime()), done: true };
  if (source instanceof RegExp)
    return { value: new RegExp(source.source, source.flags), done: true };
  if (source instanceof Map) return { value: new Map<unknown, unknown>(), done: false };
  if (source instanceof Set) return { value: new Set<unknown>(), done: false };
  if (ArrayBuffer.isView(source)) {
    const view = source as unknown as { slice(): unknown };
    return { value: view.slice(), done: true };
  }
  return { value: {}, done: false };
}

/** Queues the work to copy `source`'s contents into the already-created `target`. */
function fill(
  source: object,
  target: unknown,
  clone: (value: unknown, assign: (cloned: unknown) => void) => void,
): void {
  if (Array.isArray(source)) {
    const out = target as unknown[];
    for (let i = 0; i < source.length; i += 1) {
      clone(source[i], (cloned) => {
        out[i] = cloned;
      });
    }
    return;
  }

  if (source instanceof Map) {
    const out = target as Map<unknown, unknown>;
    for (const [key, value] of source) {
      clone(key, (clonedKey) => {
        clone(value, (clonedValue) => {
          out.set(clonedKey, clonedValue);
        });
      });
    }
    return;
  }

  if (source instanceof Set) {
    const out = target as Set<unknown>;
    for (const value of source) {
      clone(value, (cloned) => {
        out.add(cloned);
      });
    }
    return;
  }

  const record = source as Record<string, unknown>;
  const out = target as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    clone(record[key], (cloned) => {
      out[key] = cloned;
    });
  }
}
