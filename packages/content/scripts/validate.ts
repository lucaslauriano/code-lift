/**
 * Validates every question without touching the database.
 *
 * Runs in CI and before a commit. A question that fails here must never reach the app: the whole
 * point is that a reference solution which cannot pass its own cases is a broken question.
 */
import { loadAllQuestions } from '../src/load';
import { validateQuestion, type QuestionReport } from '../src/validate';

const GREEN = '\u001b[32m';
const RED = '\u001b[31m';
const DIM = '\u001b[2m';
const RESET = '\u001b[0m';

async function main(): Promise<void> {
  const questions = loadAllQuestions();
  if (questions.length === 0) {
    console.error('No questions found under packages/content/questions.');
    process.exit(1);
  }

  const reports: QuestionReport[] = [];
  for (const question of questions) {
    const report = await validateQuestion(question);
    reports.push(report);
    print(report);
  }

  const failed = reports.filter((report) => !report.ok);
  const slowest = reports.reduce((max, r) => Math.max(max, r.slowestPerfCaseMs), 0);

  console.log('');
  console.log(
    `${reports.length - failed.length}/${reports.length} questions valid ` +
      `${DIM}(slowest performance case: ${Math.round(slowest)}ms)${RESET}`,
  );

  if (failed.length > 0) process.exit(1);
}

function print(report: QuestionReport): void {
  const { counts } = report;
  const shape = `${counts.public} public · ${counts.hidden} hidden · ${counts.perf} perf`;

  if (report.ok) {
    console.log(
      `${GREEN}✓${RESET} ${report.slug.padEnd(26)} ${DIM}${shape} · ${Math.round(report.durationMs)}ms${RESET}`,
    );
    return;
  }

  console.log(`${RED}✗${RESET} ${report.slug.padEnd(26)} ${DIM}${shape}${RESET}`);
  for (const problem of report.problems) {
    console.log(`    ${RED}${problem}${RESET}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
