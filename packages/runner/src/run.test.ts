import { describe, expect, it } from 'vitest';
import type { TestCase } from '@code-lift/shared';
import { runCode } from './run';

const cases: TestCase[] = [
  { name: 'doubles 2', input: [2], expected: 4 },
  { name: 'doubles 3', input: [3], expected: 6, hidden: true },
];

describe('runCode', () => {
  it('runs a TypeScript solution and reports every case', async () => {
    const result = await runCode({
      code: 'export function solution(n: number): number { return n * 2; }',
      language: 'typescript',
      cases,
    });

    expect(result.compileError).toBeNull();
    expect(result.status).toBe('passed');
    expect(result.cases.map((c) => c.status)).toEqual(['passed', 'passed']);
    expect(result.cases[1]?.hidden).toBe(true);
  });

  it('accepts a default export as the entry point', async () => {
    const result = await runCode({
      code: 'export default function (n: number) { return n * 2; }',
      language: 'typescript',
      cases,
    });
    expect(result.status).toBe('passed');
  });

  it('accepts plain JavaScript', async () => {
    const result = await runCode({
      code: 'export function solution(n) { return n * 2; }',
      language: 'javascript',
      cases,
    });
    expect(result.status).toBe('passed');
  });

  it('reports a failing case with both values rendered', async () => {
    const result = await runCode({
      code: 'export function solution(n: number): number { return n * 3; }',
      language: 'typescript',
      cases: [cases[0] as TestCase],
    });

    expect(result.status).toBe('failed');
    expect(result.cases[0]?.received).toBe('6');
    expect(result.cases[0]?.expected).toBe('4');
  });

  it('surfaces a syntax error as a compile error rather than a crash', async () => {
    const result = await runCode({
      code: 'export function solution( {',
      language: 'typescript',
      cases,
    });

    expect(result.status).toBe('error');
    expect(result.compileError).toBeTruthy();
    expect(result.cases).toHaveLength(0);
  });

  it('explains a missing solution export', async () => {
    const result = await runCode({
      code: 'export const notTheOne = 1;',
      language: 'typescript',
      cases,
    });
    expect(result.compileError).toContain('No `solution` function was exported');
  });

  it('rejects an import instead of failing with "require is not defined"', async () => {
    const result = await runCode({
      code: "import fs from 'node:fs';\nexport function solution() { return fs; }",
      language: 'typescript',
      cases,
    });
    expect(result.compileError).toContain('self-contained file');
  });

  it('isolates a case that throws, and keeps running the rest', async () => {
    const result = await runCode({
      code: 'export function solution(n: number): number { if (n === 2) throw new Error("boom"); return n * 2; }',
      language: 'typescript',
      cases,
    });

    expect(result.status).toBe('error');
    expect(result.cases[0]?.status).toBe('error');
    expect(result.cases[0]?.error).toContain('boom');
    expect(result.cases[1]?.status).toBe('passed');
  });

  it('awaits an async solution', async () => {
    const result = await runCode({
      code: 'export async function solution(n: number): Promise<number> { return n * 2; }',
      language: 'typescript',
      cases,
    });
    expect(result.status).toBe('passed');
  });

  it('captures console output and attributes it to the running case', async () => {
    const result = await runCode({
      code: 'export function solution(n: number): number { console.log("saw", n); return n * 2; }',
      language: 'typescript',
      cases,
    });

    expect(result.logs).toHaveLength(2);
    expect(result.logs[0]).toMatchObject({ level: 'log', message: 'saw 2', caseIndex: 0 });
    expect(result.logs[1]?.caseIndex).toBe(1);
  });

  it('restores the real console afterwards', async () => {
    const original = console.log;
    await runCode({
      code: 'export function solution(n: number): number { console.log(n); return n * 2; }',
      language: 'typescript',
      cases,
    });
    expect(console.log).toBe(original);
  });

  it('clones inputs so a solution that mutates in place cannot corrupt a later case', async () => {
    const shared = [3, 1, 2];
    const result = await runCode({
      code: 'export function solution(xs: number[]): number[] { return xs.sort((a, b) => a - b); }',
      language: 'typescript',
      cases: [
        { name: 'sorts', input: [shared], expected: [1, 2, 3] },
        { name: 'same input, still unsorted', input: [shared], expected: [1, 2, 3] },
      ],
    });

    expect(result.status).toBe('passed');
    expect(shared).toEqual([3, 1, 2]);
  });

  it('streams each case to the callback as it settles', async () => {
    const seen: number[] = [];
    await runCode({
      code: 'export function solution(n: number): number { return n * 2; }',
      language: 'typescript',
      cases,
      onCase: (result) => seen.push(result.index),
    });
    expect(seen).toEqual([0, 1]);
  });
});
