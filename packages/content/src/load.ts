import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { evaluateModule, transpile } from '@code-lift/runner';
import {
  questionMetaSchema,
  testCaseSchema,
  type QuestionMeta,
  type TestCase,
} from '@code-lift/shared';
import { QUESTIONS_ROOT } from './paths';

/** Files every question folder must contain. */
const REQUIRED_FILES = [
  'meta.json',
  'prompt.mdx',
  'starter.ts',
  'solution.ts',
  'cases.ts',
  'editorial.mdx',
] as const;

export interface LoadedQuestion {
  meta: QuestionMeta;
  /** Absolute path of the question folder — handy in validation errors. */
  dir: string;
  /** sha256 over every source file; `content:sync` compares it to decide whether to write. */
  contentVersion: string;
  prompt: string;
  editorial: string;
  starter: string;
  solution: string;
  cases: TestCase[];
}

export class ContentError extends Error {
  override readonly name = 'ContentError';
}

/** Question categories on disk, e.g. `algo`, `js`, `ui`. */
export function listCategories(): string[] {
  if (!existsSync(QUESTIONS_ROOT)) return [];
  return readdirSync(QUESTIONS_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function listQuestionSlugs(): string[] {
  return listCategories()
    .flatMap((category) =>
      readdirSync(join(QUESTIONS_ROOT, category), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name),
    )
    .sort();
}

function findQuestionDir(slug: string): string {
  for (const category of listCategories()) {
    const dir = join(QUESTIONS_ROOT, category, slug);
    if (existsSync(join(dir, 'meta.json'))) return dir;
  }
  throw new ContentError(`No question found with slug "${slug}".`);
}

export function loadQuestion(slug: string): LoadedQuestion {
  const dir = findQuestionDir(slug);

  const sources = new Map<string, string>();
  for (const file of REQUIRED_FILES) {
    const path = resolve(dir, file);
    if (!existsSync(path)) throw new ContentError(`${slug}: missing ${file}`);
    sources.set(file, readFileSync(path, 'utf8'));
  }

  const meta = parseMeta(slug, sources.get('meta.json') ?? '');
  if (meta.slug !== slug) {
    throw new ContentError(
      `${slug}: meta.json declares slug "${meta.slug}"; it must match the folder name.`,
    );
  }

  return {
    meta,
    dir,
    contentVersion: hashSources(sources),
    prompt: sources.get('prompt.mdx') ?? '',
    editorial: sources.get('editorial.mdx') ?? '',
    starter: sources.get('starter.ts') ?? '',
    solution: sources.get('solution.ts') ?? '',
    cases: parseCases(slug, sources.get('cases.ts') ?? ''),
  };
}

export function loadAllQuestions(): LoadedQuestion[] {
  return listQuestionSlugs().map(loadQuestion);
}

function parseMeta(slug: string, source: string): QuestionMeta {
  let raw: unknown;
  try {
    raw = JSON.parse(source);
  } catch (error) {
    throw new ContentError(`${slug}: meta.json is not valid JSON — ${(error as Error).message}`);
  }

  const parsed = questionMetaSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new ContentError(`${slug}: meta.json failed validation\n${issues}`);
  }
  return parsed.data;
}

/**
 * `cases.ts` is executed, not parsed: a performance case builds a 100k-element input in code, which
 * no static format could express. It runs through the same transpile/evaluate path as a submission,
 * so any syntax the runner cannot handle fails here rather than in the browser.
 */
function parseCases(slug: string, source: string): TestCase[] {
  let exported: unknown;
  try {
    exported = evaluateModule(transpile(source, 'typescript'))['cases'];
  } catch (error) {
    throw new ContentError(
      `${slug}: cases.ts could not be evaluated — ${(error as Error).message}`,
    );
  }

  if (!Array.isArray(exported)) {
    throw new ContentError(`${slug}: cases.ts must export a "cases" array of TestCase.`);
  }

  return exported.map((value, index) => {
    const parsed = testCaseSchema.safeParse(value);
    if (!parsed.success) {
      throw new ContentError(
        `${slug}: case ${index} is malformed — ${parsed.error.issues[0]?.message ?? 'unknown'}`,
      );
    }
    return parsed.data;
  });
}

function hashSources(sources: ReadonlyMap<string, string>): string {
  const hash = createHash('sha256');
  for (const file of REQUIRED_FILES) {
    hash
      .update(file)
      .update(' ')
      .update(sources.get(file) ?? '')
      .update(' ');
  }
  return hash.digest('hex').slice(0, 16);
}
