import { z } from 'zod';
import {
  companySchema,
  difficultySchema,
  languageSchema,
  mockPresetSchema,
  progressStatusSchema,
  questionTypeSchema,
  submissionStatusSchema,
  topicSchema,
} from './enums';
import { questionSummarySchema } from './question';

/* ---------------------------------------------------------------- auth -- */

export const loginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(200),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const sessionUserSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string().nullable(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

/* ----------------------------------------------------------- questions -- */

export const listQuestionsQuerySchema = z.object({
  type: questionTypeSchema.optional(),
  difficulty: difficultySchema.optional(),
  topic: topicSchema.optional(),
  company: companySchema.optional(),
  status: progressStatusSchema.optional(),
  bookmarked: z.coerce.boolean().optional(),
  q: z.string().max(100).optional(),
});
export type ListQuestionsQuery = z.infer<typeof listQuestionsQuerySchema>;

export const listQuestionsResponseSchema = z.object({
  questions: z.array(questionSummarySchema),
  total: z.number().int().nonnegative(),
});
export type ListQuestionsResponse = z.infer<typeof listQuestionsResponseSchema>;

/* --------------------------------------------------------- submissions -- */

export const createSubmissionRequestSchema = z.object({
  questionSlug: z.string().min(1),
  language: languageSchema,
  code: z.string().max(200_000),
  status: submissionStatusSchema,
  passedCases: z.number().int().nonnegative(),
  totalCases: z.number().int().nonnegative(),
  durationMs: z.number().nonnegative(),
  mockSessionId: z.string().optional(),
});
export type CreateSubmissionRequest = z.infer<typeof createSubmissionRequestSchema>;

export const submissionSchema = z.object({
  id: z.string(),
  questionSlug: z.string(),
  language: languageSchema,
  code: z.string(),
  status: submissionStatusSchema,
  passedCases: z.number().int().nonnegative(),
  totalCases: z.number().int().nonnegative(),
  durationMs: z.number().nonnegative(),
  mockSessionId: z.string().nullable(),
  createdAt: z.string(),
});
export type Submission = z.infer<typeof submissionSchema>;

/* ------------------------------------------------------------ progress -- */

export const updateProgressRequestSchema = z.object({ status: progressStatusSchema });
export type UpdateProgressRequest = z.infer<typeof updateProgressRequestSchema>;

export const topicProgressSchema = z.object({
  topic: topicSchema,
  total: z.number().int().nonnegative(),
  done: z.number().int().nonnegative(),
  /** failed submissions / all submissions on this topic; drives the "weak topics" list. */
  failureRate: z.number().min(0).max(1),
});
export type TopicProgress = z.infer<typeof topicProgressSchema>;

export const progressSummarySchema = z.object({
  totals: z.object({
    done: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
  }),
  byDifficulty: z.array(
    z.object({
      difficulty: difficultySchema,
      done: z.number().int().nonnegative(),
      total: z.number().int().nonnegative(),
    }),
  ),
  byTopic: z.array(topicProgressSchema),
  /** ISO date (YYYY-MM-DD) → questions solved that day, last 12 weeks. */
  activity: z.array(z.object({ date: z.string(), count: z.number().int().nonnegative() })),
  streakDays: z.number().int().nonnegative(),
  recentSubmissions: z.array(submissionSchema),
});
export type ProgressSummary = z.infer<typeof progressSummarySchema>;

/* ------------------------------------------------------- mock sessions -- */

export const createMockSessionRequestSchema = z.object({
  preset: mockPresetSchema.default('toptal_codility'),
  /** Only honoured when preset is `custom`. */
  questionSlugs: z.array(z.string().min(1)).min(1).max(10).optional(),
});
export type CreateMockSessionRequest = z.infer<typeof createMockSessionRequestSchema>;

export const mockQuestionResultSchema = z.object({
  questionSlug: z.string(),
  title: z.string(),
  difficulty: difficultySchema,
  attempted: z.boolean(),
  passedCases: z.number().int().nonnegative(),
  totalCases: z.number().int().nonnegative(),
  perfPassed: z.number().int().nonnegative(),
  perfTotal: z.number().int().nonnegative(),
  /** 0–100. correctness * 0.7 + performance * 0.3. */
  score: z.number().min(0).max(100),
});
export type MockQuestionResult = z.infer<typeof mockQuestionResultSchema>;

export const mockSessionSchema = z.object({
  id: z.string(),
  preset: mockPresetSchema,
  questionSlugs: z.array(z.string()),
  startedAt: z.string(),
  /** Authoritative deadline, computed server-side. The client timer is presentation only. */
  endsAt: z.string(),
  finishedAt: z.string().nullable(),
  score: z.number().min(0).max(100).nullable(),
  results: z.array(mockQuestionResultSchema).nullable(),
});
export type MockSession = z.infer<typeof mockSessionSchema>;

export const TOPTAL_CODILITY_PRESET = {
  durationMinutes: 90,
  questionCount: 3,
  /** One of each, from three different topics. */
  difficulties: ['easy', 'medium', 'hard'],
} as const;

/* --------------------------------------------------------------- error -- */

export const apiErrorSchema = z.object({
  statusCode: z.number().int(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string().optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;
