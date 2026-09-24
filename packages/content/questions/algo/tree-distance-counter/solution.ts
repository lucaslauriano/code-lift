/**
 * Build an adjacency list, then breadth-first search from the capital.
 *
 * The roads are given one-way (child to parent) but they are two-way in the country, so each entry
 * has to become an edge in both directions — otherwise BFS from the capital can only ever reach its
 * own parent chain.
 *
 * BFS rather than DFS because distance is the whole question: BFS visits in distance order, so a
 * node's distance is its parent's plus one, with no revisiting.
 *
 * The adjacency list is built as flat arrays rather than a Map of arrays: with 100k cities the
 * difference between one allocation and 100k small ones is measurable.
 *
 * Time  O(N) — every city and every road is touched a constant number of times.
 * Space O(N).
 */
export function solution(t: number[]): number[] {
  const n = t.length;

  let capital = -1;
  let edgeCount = 0;
  for (let i = 0; i < n; i += 1) {
    if (t[i] === i) capital = i;
    else edgeCount += 1;
  }
  if (capital === -1) return [];

  // Count the degree of each city so the flat adjacency array can be sliced up in advance.
  const degree = new Int32Array(n);
  for (let i = 0; i < n; i += 1) {
    if (t[i] === i) continue;
    const parent = t[i] as number;
    degree[i] = (degree[i] as number) + 1;
    degree[parent] = (degree[parent] as number) + 1;
  }

  const start = new Int32Array(n + 1);
  for (let i = 0; i < n; i += 1) start[i + 1] = (start[i] as number) + (degree[i] as number);

  const cursor = start.slice(0, n);
  const neighbours = new Int32Array(edgeCount * 2);
  for (let i = 0; i < n; i += 1) {
    if (t[i] === i) continue;
    const parent = t[i] as number;
    neighbours[cursor[i] as number] = parent;
    cursor[i] = (cursor[i] as number) + 1;
    neighbours[cursor[parent] as number] = i;
    cursor[parent] = (cursor[parent] as number) + 1;
  }

  // BFS from the capital, counting how many cities land at each distance.
  const distance = new Int32Array(n).fill(-1);
  distance[capital] = 0;
  const queue = new Int32Array(n);
  queue[0] = capital;
  let head = 0;
  let tail = 1;

  const perDistance: number[] = [];

  while (head < tail) {
    const city = queue[head] as number;
    head += 1;
    const next = (distance[city] as number) + 1;

    for (let e = start[city] as number; e < (start[city + 1] as number); e += 1) {
      const neighbour = neighbours[e] as number;
      if (distance[neighbour] !== -1) continue;
      distance[neighbour] = next;
      perDistance[next - 1] = (perDistance[next - 1] ?? 0) + 1;
      queue[tail] = neighbour;
      tail += 1;
    }
  }

  return perDistance;
}
