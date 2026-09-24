import { z } from 'zod';

export const questionTypeSchema = z.enum(['algo', 'js', 'ui', 'system-design']);
export type QuestionType = z.infer<typeof questionTypeSchema>;

export const difficultySchema = z.enum(['easy', 'medium', 'hard']);
export type Difficulty = z.infer<typeof difficultySchema>;

/**
 * Topics are a closed set on purpose: the dashboard groups "weak topics" by them, so a typo in a
 * `meta.json` must fail validation instead of silently creating a one-question category.
 */
export const topicSchema = z.enum([
  // algorithms
  'arrays',
  'bit-manipulation',
  'counting',
  'greedy',
  'hashing',
  'math',
  'prefix-sums',
  'recursion',
  'sorting',
  'stacks',
  'strings',
  'two-pointers',
  // javascript / frontend (fases 2+)
  'async',
  'closures',
  'functional',
  'objects',
  'dom',
  'react',
  'css',
  'accessibility',
  'performance',
  'architecture',
]);
export type Topic = z.infer<typeof topicSchema>;

export const companySchema = z.enum([
  'toptal',
  'google',
  'meta',
  'amazon',
  'microsoft',
  'apple',
  'netflix',
  'airbnb',
  'stripe',
  'uber',
  'linkedin',
  'shopify',
]);
export type Company = z.infer<typeof companySchema>;

export const languageSchema = z.enum(['typescript', 'javascript']);
export type Language = z.infer<typeof languageSchema>;

export const submissionStatusSchema = z.enum(['passed', 'failed', 'error', 'timeout']);
export type SubmissionStatus = z.infer<typeof submissionStatusSchema>;

export const progressStatusSchema = z.enum(['todo', 'in_progress', 'done', 'skipped']);
export type ProgressStatus = z.infer<typeof progressStatusSchema>;

export const mockPresetSchema = z.enum(['toptal_codility', 'custom']);
export type MockPreset = z.infer<typeof mockPresetSchema>;

export const flashcardRatingSchema = z.enum(['again', 'hard', 'good', 'easy']);
export type FlashcardRating = z.infer<typeof flashcardRatingSchema>;

export const quizFormatSchema = z.enum(['mcq', 'open']);
export type QuizFormat = z.infer<typeof quizFormatSchema>;

export const DIFFICULTY_ORDER: readonly Difficulty[] = ['easy', 'medium', 'hard'] as const;
