import { z } from 'zod';
import { companySchema, difficultySchema, questionTypeSchema, topicSchema } from './enums';

/**
 * A single test case. `input` is the argument list spread into the solution function, so a
 * one-argument solution still gets `input: [value]`.
 */
export const testCaseSchema = z.object({
  name: z.string().min(1).optional(),
  input: z.array(z.unknown()),
  expected: z.unknown(),
  /** Not shown in the editor; only runs on Submit. Hidden in the UI, not secret — it ships to the browser. */
  hidden: z.boolean().optional(),
  /** Large-N case used to catch accidental O(n^2). Gets a longer budget. */
  perf: z.boolean().optional(),
  /** Per-case budget override, in milliseconds. */
  timeoutMs: z.number().int().positive().optional(),
  /**
   * Wall-clock a performance case may take before it counts as failed, even if the answer is right.
   * This is what makes the performance dimension real: an O(N^2) solution returns the correct value,
   * just far too slowly. Defaults to DEFAULT_PERF_CASE_BUDGET_MS.
   */
  perfBudgetMs: z.number().int().positive().optional(),
});
export type TestCase = z.infer<typeof testCaseSchema>;

export const questionMetaSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug must be kebab-case'),
  title: z.string().min(1),
  type: questionTypeSchema,
  difficulty: difficultySchema,
  summary: z.string().min(1).max(280),
  topics: z.array(topicSchema).min(1),
  companies: z.array(companySchema).default([]),
  estimatedMinutes: z.number().int().positive().max(240),
  source: z.string().min(1).optional(),
  /** Big-O the reference solution achieves; surfaced in the UI and in the editorial. */
  expectedComplexity: z.object({ time: z.string().min(1), space: z.string().min(1) }).optional(),
});
export type QuestionMeta = z.infer<typeof questionMetaSchema>;

/** A question as the API returns it in list views. */
export const questionSummarySchema = questionMetaSchema.extend({
  isPremium: z.boolean(),
  contentVersion: z.string(),
  progressStatus: z.enum(['todo', 'in_progress', 'done', 'skipped']),
  bookmarked: z.boolean(),
  lastAttemptAt: z.string().datetime().nullable(),
});
export type QuestionSummary = z.infer<typeof questionSummarySchema>;
