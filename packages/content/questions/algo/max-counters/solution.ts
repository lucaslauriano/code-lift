/**
 * The trick is to never perform a "max counter" operation. Instead, remember the floor that the
 * last one established and apply it lazily: a counter that has not been touched since then is
 * really worth `floor`, whatever stale number it still holds.
 *
 * Every increase first lifts its counter to the floor (if it is behind), then adds one. A final
 * sweep lifts everything that was never touched after the last max-counter.
 *
 * Time  O(N + M) — one pass over the operations, one closing pass over the counters.
 * Space O(N).
 */
export function solution(n: number, a: number[]): number[] {
  const counters = new Array<number>(n).fill(0);

  /** The value every counter is guaranteed to have reached, thanks to the last max-counter. */
  let floor = 0;
  /** The running maximum, which is what the next max-counter will raise the floor to. */
  let peak = 0;

  for (const operation of a) {
    if (operation === n + 1) {
      floor = peak;
      continue;
    }

    const index = operation - 1;
    const current = Math.max(counters[index] as number, floor);
    const next = current + 1;
    counters[index] = next;
    if (next > peak) peak = next;
  }

  for (let i = 0; i < n; i += 1) {
    if ((counters[i] as number) < floor) counters[i] = floor;
  }

  return counters;
}
