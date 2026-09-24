import { describe, expect, it } from 'vitest';
import { questionMetaSchema, testCaseSchema } from './question';
import { createSubmissionRequestSchema, listQuestionsQuerySchema } from './api';

const validMeta = {
  slug: 'frog-river-one',
  title: 'Frog River One',
  type: 'algo',
  difficulty: 'medium',
  summary: 'Find the earliest time the frog can cross the river.',
  topics: ['arrays'],
  companies: ['toptal'],
  estimatedMinutes: 20,
};

describe('questionMetaSchema', () => {
  it('accepts a well-formed meta and defaults companies to an empty list', () => {
    const { companies, ...withoutCompanies } = validMeta;
    expect(companies).toEqual(['toptal']);
    expect(questionMetaSchema.parse(withoutCompanies).companies).toEqual([]);
  });

  it('rejects a slug that is not kebab-case', () => {
    expect(() => questionMetaSchema.parse({ ...validMeta, slug: 'Frog_River' })).toThrow();
  });

  it('rejects an unknown topic so a typo never becomes a new category', () => {
    expect(() => questionMetaSchema.parse({ ...validMeta, topics: ['arrayz'] })).toThrow();
  });

  it('requires at least one topic', () => {
    expect(() => questionMetaSchema.parse({ ...validMeta, topics: [] })).toThrow();
  });
});

describe('testCaseSchema', () => {
  it('keeps an explicitly undefined expected value', () => {
    const parsed = testCaseSchema.parse({ input: [1], expected: undefined });
    expect('expected' in parsed).toBe(true);
  });

  it('rejects a non-array input', () => {
    expect(() => testCaseSchema.parse({ input: 1, expected: 1 })).toThrow();
  });
});

describe('listQuestionsQuerySchema', () => {
  it('leaves every filter optional', () => {
    expect(listQuestionsQuerySchema.parse({})).toEqual({});
  });

  it('coerces the bookmarked flag coming from the query string', () => {
    expect(listQuestionsQuerySchema.parse({ bookmarked: 'true' }).bookmarked).toBe(true);
  });
});

describe('createSubmissionRequestSchema', () => {
  it('rejects a negative case count', () => {
    expect(() =>
      createSubmissionRequestSchema.parse({
        questionSlug: 'distinct',
        language: 'typescript',
        code: 'export function solution() {}',
        status: 'passed',
        passedCases: -1,
        totalCases: 10,
        durationMs: 12,
      }),
    ).toThrow();
  });
});
