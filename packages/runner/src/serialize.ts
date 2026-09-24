const MAX_ARRAY_PREVIEW = 20;
const MAX_STRING_LENGTH = 400;
const MAX_DEPTH = 6;
const MAX_TOTAL_LENGTH = 2_000;

/**
 * Renders a value for display in the results panel.
 *
 * Aggressively bounded on purpose: a performance case holds 100k elements, and neither the
 * structured-clone boundary nor the DOM should ever see the whole thing.
 */
export function serializeValue(value: unknown): string {
  const text = render(value, 0, new WeakSet());
  return text.length > MAX_TOTAL_LENGTH ? `${text.slice(0, MAX_TOTAL_LENGTH)}… (truncated)` : text;
}

/** Formats whatever was thrown, keeping the first few stack frames when there are any. */
export function serializeError(error: unknown): string {
  if (error instanceof Error) {
    const head = `${error.name}: ${error.message}`;
    const frames = (error.stack ?? '')
      .split('\n')
      .slice(1, 4)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.includes('runner/src'));
    return frames.length > 0 ? `${head}\n    ${frames.join('\n    ')}` : head;
  }
  return `Thrown value: ${serializeValue(error)}`;
}

function render(value: unknown, depth: number, seen: WeakSet<object>): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  switch (typeof value) {
    case 'string':
      return JSON.stringify(
        value.length > MAX_STRING_LENGTH ? `${value.slice(0, MAX_STRING_LENGTH)}…` : value,
      );
    case 'number':
      return Object.is(value, -0) ? '-0' : String(value);
    case 'bigint':
      return `${value}n`;
    case 'boolean':
      return String(value);
    case 'function':
      return `[Function ${value.name || 'anonymous'}]`;
    case 'symbol':
      return value.toString();
    default:
      break;
  }

  const object = value as object;
  if (seen.has(object)) return '[Circular]';
  if (depth >= MAX_DEPTH) return Array.isArray(object) ? '[Array]' : '[Object]';
  seen.add(object);

  try {
    if (Array.isArray(object)) return renderArray(object, depth, seen);
    if (object instanceof Date) return object.toISOString();
    if (object instanceof RegExp) return object.toString();
    if (object instanceof Error) return serializeError(object);
    if (object instanceof Map) {
      const entries = [...object.entries()]
        .slice(0, MAX_ARRAY_PREVIEW)
        .map(
          ([key, item]) => `${render(key, depth + 1, seen)} => ${render(item, depth + 1, seen)}`,
        );
      return `Map(${object.size}) {${entries.join(', ')}${object.size > MAX_ARRAY_PREVIEW ? ', …' : ''}}`;
    }
    if (object instanceof Set) {
      const items = [...object.values()]
        .slice(0, MAX_ARRAY_PREVIEW)
        .map((item) => render(item, depth + 1, seen));
      return `Set(${object.size}) {${items.join(', ')}${object.size > MAX_ARRAY_PREVIEW ? ', …' : ''}}`;
    }
    if (ArrayBuffer.isView(object)) {
      return renderArray([...(object as unknown as Iterable<number>)], depth, seen);
    }

    const record = object as Record<string, unknown>;
    const keys = Object.keys(record);
    const body = keys
      .slice(0, MAX_ARRAY_PREVIEW)
      .map((key) => `${key}: ${render(record[key], depth + 1, seen)}`)
      .join(', ');
    const more =
      keys.length > MAX_ARRAY_PREVIEW ? `, … ${keys.length - MAX_ARRAY_PREVIEW} more` : '';
    return `{ ${body}${more} }`;
  } finally {
    seen.delete(object);
  }
}

function renderArray(items: readonly unknown[], depth: number, seen: WeakSet<object>): string {
  const preview = items
    .slice(0, MAX_ARRAY_PREVIEW)
    .map((item) => render(item, depth + 1, seen))
    .join(', ');
  if (items.length <= MAX_ARRAY_PREVIEW) return `[${preview}]`;
  return `[${preview}, … ${items.length - MAX_ARRAY_PREVIEW} more (${items.length} total)]`;
}
