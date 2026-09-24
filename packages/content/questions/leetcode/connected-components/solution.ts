/**
 * Union-find, with each edge merging two groups.
 *
 * Start with n components and subtract one every time an edge joins two that were separate. An edge
 * inside a component changes nothing, which is what makes duplicate edges harmless.
 *
 * Chosen over a traversal because it answers the question directly — no adjacency list to build,
 * no stack to manage, and nothing that can recurse too deep. Path compression plus union by size
 * keeps each operation effectively constant.
 *
 * Time  O(V + E * alpha(V)), which is linear for any input that fits in memory.
 * Space O(V).
 */
export function solution(n: number, edges: number[][]): number {
  const parent = new Int32Array(n);
  for (let i = 0; i < n; i += 1) parent[i] = i;
  const size = new Int32Array(n).fill(1);

  /** Finds the representative, flattening the path on the way back. */
  const find = (start: number): number => {
    let root = start;
    while ((parent[root] as number) !== root) root = parent[root] as number;

    let node = start;
    while ((parent[node] as number) !== root) {
      const next = parent[node] as number;
      parent[node] = root;
      node = next;
    }
    return root;
  };

  let components = n;

  for (const edge of edges) {
    let a = find(edge[0] as number);
    let b = find(edge[1] as number);
    if (a === b) continue;

    // Attach the smaller tree under the larger one, keeping the structure shallow.
    if ((size[a] as number) < (size[b] as number)) {
      const swap = a;
      a = b;
      b = swap;
    }
    parent[b] = a;
    size[a] = (size[a] as number) + (size[b] as number);
    components -= 1;
  }

  return components;
}
