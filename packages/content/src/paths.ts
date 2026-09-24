import { resolve } from 'node:path';

/**
 * Root of the content tree.
 *
 * Resolved from `__dirname` so it works both from `src` (tsx, tests) and from `dist` (the API and
 * the Next server) — `questions/` is a sibling of both.
 */
export const CONTENT_ROOT = resolve(__dirname, '..');
export const QUESTIONS_ROOT = resolve(CONTENT_ROOT, 'questions');
