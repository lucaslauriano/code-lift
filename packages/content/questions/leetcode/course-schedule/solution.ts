/**
 * The question is only ever "does this directed graph have a cycle?" — every acyclic prerequisite
 * graph has some valid order, and every cycle makes one impossible.
 *
 * Kahn's algorithm answers it by construction: repeatedly take a course with nothing outstanding,
 * and cross it off its dependents. If some courses are never reachable that way, they are waiting
 * on each other.
 *
 * Chosen over a DFS colouring because it is naturally iterative — a chain of 100,000 courses would
 * make a recursive DFS 100,000 frames deep.
 *
 * The adjacency list is stored as flat typed arrays rather than an array of arrays: with 100,000
 * courses that is one allocation instead of 100,000 small ones.
 *
 * Time  O(V + E).
 * Space O(V + E).
 */
export function solution(numCourses: number, prerequisites: number[][]): boolean {
  const edges = prerequisites.length;

  // Count outgoing edges per prerequisite so the flat adjacency array can be sliced in advance.
  const outDegree = new Int32Array(numCourses);
  const inDegree = new Int32Array(numCourses);
  for (const pair of prerequisites) {
    const course = pair[0] as number;
    const needs = pair[1] as number;
    outDegree[needs] = (outDegree[needs] as number) + 1;
    inDegree[course] = (inDegree[course] as number) + 1;
  }

  const start = new Int32Array(numCourses + 1);
  for (let i = 0; i < numCourses; i += 1) {
    start[i + 1] = (start[i] as number) + (outDegree[i] as number);
  }

  const cursor = start.slice(0, numCourses);
  const dependents = new Int32Array(edges);
  for (const pair of prerequisites) {
    const course = pair[0] as number;
    const needs = pair[1] as number;
    dependents[cursor[needs] as number] = course;
    cursor[needs] = (cursor[needs] as number) + 1;
  }

  // Everything with no outstanding prerequisites can be taken now.
  const queue = new Int32Array(numCourses);
  let tail = 0;
  for (let course = 0; course < numCourses; course += 1) {
    if (inDegree[course] === 0) {
      queue[tail] = course;
      tail += 1;
    }
  }

  let taken = 0;
  for (let head = 0; head < tail; head += 1) {
    const course = queue[head] as number;
    taken += 1;

    for (let e = start[course] as number; e < (start[course + 1] as number); e += 1) {
      const dependent = dependents[e] as number;
      const remaining = (inDegree[dependent] as number) - 1;
      inDegree[dependent] = remaining;
      if (remaining === 0) {
        queue[tail] = dependent;
        tail += 1;
      }
    }
  }

  return taken === numCourses;
}
