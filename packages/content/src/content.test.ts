import { describe, expect, it } from 'vitest';
import { listQuestionSlugs, loadQuestion } from './load';
import { validateQuestion } from './validate';

const slugs = listQuestionSlugs();

describe('content library', () => {
  it('ships at least the ten seed algorithm questions', () => {
    expect(slugs.length).toBeGreaterThanOrEqual(10);
  });

  it('gives every question a distinct content version', () => {
    const versions = slugs.map((slug) => loadQuestion(slug).contentVersion);
    expect(new Set(versions).size).toBe(versions.length);
  });
});

// The contract that lets us trust the whole content pipeline: a question only counts as valid if
// its own reference solution passes every case it ships, inside the real runner.
describe.each(slugs)('question: %s', (slug) => {
  it('passes its own cases and meets the case-count minimums', async () => {
    const report = await validateQuestion(loadQuestion(slug));
    expect(report.problems).toEqual([]);
    expect(report.ok).toBe(true);
  });
});
