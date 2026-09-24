import { z } from 'zod';
import {
  companySchema,
  difficultySchema,
  progressStatusSchema,
  questionTypeSchema,
  topicSchema,
  trackSchema,
} from './enums';

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
  track: trackSchema.default('codility'),
  /**
   * Why this question ships without performance cases.
   *
   * Some problems have no performance dimension to test: climbing stairs caps at n = 45, and a
   * 100k-node input would only measure the harness. Rather than pad those with meaningless cases,
   * a question may opt out — but it has to say why, so the exemption stays a decision rather than
   * an oversight.
   */
  performanceExemption: z.string().min(20).optional(),
  /** Big-O the reference solution achieves; surfaced in the UI and in the editorial. */
  expectedComplexity: z.object({ time: z.string().min(1), space: z.string().min(1) }).optional(),
});
export type QuestionMeta = z.infer<typeof questionMetaSchema>;

/** A question as the API returns it in list views. */
export const questionSummarySchema = questionMetaSchema.extend({
  isPremium: z.boolean(),
  contentVersion: z.string(),
  progressStatus: progressStatusSchema,
  bookmarked: z.boolean(),
  lastAttemptAt: z.string().datetime().nullable(),
});
export type QuestionSummary = z.infer<typeof questionSummarySchema>;

/**
 * Everything the workspace needs to let you start solving — and nothing more.
 *
 * No solution, no editorial, no hidden cases: those are separate requests so that a mock session
 * can withhold them, and so the first paint does not ship a 100k-element performance input.
 */
export const questionDetailSchema = z.object({
  meta: questionMetaSchema,
  progressStatus: progressStatusSchema,
  bookmarked: z.boolean(),
  /** Statement, as MDX source. Rendered by the web app. */
  prompt: z.string(),
  /** The file the editor opens with. */
  starter: z.string(),
  /** Only the cases a Run executes. */
  publicCases: z.array(testCaseSchema),
  /** Shown as "N hidden · M performance" without revealing them. */
  hiddenCaseCount: z.number().int().nonnegative(),
  perfCaseCount: z.number().int().nonnegative(),
});
export type QuestionDetail = z.infer<typeof questionDetailSchema>;

/** Fetched only when Submit runs. Includes the hidden and performance cases. */
export const questionCasesSchema = z.object({
  slug: z.string(),
  cases: z.array(testCaseSchema),
});
export type QuestionCases = z.infer<typeof questionCasesSchema>;

/** Withheld while a mock session covering this question is still running. */
export const questionEditorialSchema = z.object({
  slug: z.string(),
  solution: z.string(),
  editorial: z.string(),
});
export type QuestionEditorial = z.infer<typeof questionEditorialSchema>;
