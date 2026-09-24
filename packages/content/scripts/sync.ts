/**
 * Pushes question metadata into Postgres.
 *
 * Only metadata: the prompt, the solution and the cases stay on disk, where git can review them.
 * The database row exists so the API can filter and join against user progress.
 *
 * Validation runs first and a single failure aborts the whole sync — a half-synced catalogue is
 * worse than a stale one.
 */
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { createPrismaClientFromEnv, type Difficulty, type QuestionType } from '@code-lift/db';
import { loadAllQuestions, type LoadedQuestion } from '../src/load';
import { validateQuestion } from '../src/validate';

config({ path: resolve(__dirname, '../../../.env'), quiet: true });

/** The DB enum spells system design with an underscore; the content format uses a hyphen. */
function toPrismaType(type: LoadedQuestion['meta']['type']): QuestionType {
  return (type === 'system-design' ? 'system_design' : type) as QuestionType;
}

async function main(): Promise<void> {
  const questions = loadAllQuestions();
  console.log(`Validating ${questions.length} questions…`);

  const invalid: string[] = [];
  for (const question of questions) {
    const report = await validateQuestion(question);
    if (!report.ok) {
      invalid.push(`${report.slug}: ${report.problems.join('; ')}`);
    }
  }

  if (invalid.length > 0) {
    console.error('Refusing to sync — these questions are invalid:');
    for (const problem of invalid) console.error(`  ${problem}`);
    process.exit(1);
  }

  const prisma = createPrismaClientFromEnv();
  try {
    let written = 0;
    let unchanged = 0;

    for (const question of questions) {
      const { meta, contentVersion } = question;
      const existing = await prisma.question.findUnique({
        where: { slug: meta.slug },
        select: { contentVersion: true },
      });

      if (existing?.contentVersion === contentVersion) {
        unchanged += 1;
        continue;
      }

      const data = {
        type: toPrismaType(meta.type),
        title: meta.title,
        summary: meta.summary,
        difficulty: meta.difficulty as Difficulty,
        topics: meta.topics,
        companies: meta.companies,
        estimatedMinutes: meta.estimatedMinutes,
        contentVersion,
      };

      await prisma.question.upsert({
        where: { slug: meta.slug },
        create: { slug: meta.slug, ...data },
        update: data,
      });
      written += 1;
    }

    // A question deleted from disk must disappear from the catalogue too, but its submissions are
    // the user's history — the cascade would erase them, so we only warn.
    const slugs = new Set(questions.map((question) => question.meta.slug));
    const orphans = await prisma.question.findMany({
      where: { slug: { notIn: [...slugs] } },
      select: { slug: true },
    });
    for (const orphan of orphans) {
      console.warn(
        `  ! "${orphan.slug}" is in the database but no longer on disk — delete it by hand if that is intended.`,
      );
    }

    console.log(`Synced: ${written} written, ${unchanged} unchanged.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
