import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DIFFICULTY_ORDER,
  topicSchema,
  type Difficulty,
  type ProgressStatus,
  type ProgressSummary,
  type Submission,
  type Topic,
  type TopicProgress,
} from '@code-lift/shared';
import { PrismaService } from '../prisma/prisma.service';
import { ContentService } from '../content/content.service';

const ACTIVITY_DAYS = 12 * 7;

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly content: ContentService,
  ) {}

  async setStatus(userId: string, slug: string, status: ProgressStatus): Promise<ProgressStatus> {
    const question = await this.prisma.client.question.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!question) throw new NotFoundException(`No synced question with slug "${slug}"`);

    const row = await this.prisma.client.progress.upsert({
      where: { userId_questionId: { userId, questionId: question.id } },
      create: { userId, questionId: question.id, status, lastAttemptAt: new Date() },
      update: { status, lastAttemptAt: new Date() },
    });
    return row.status;
  }

  /**
   * Records the outcome of a submission.
   *
   * A clean submit is the only thing that marks a question done — a Run never does, because a Run
   * only touches the public cases. Done is also sticky: a later failed attempt on a solved question
   * does not demote it.
   */
  async recordSubmission(
    userId: string,
    questionId: string,
    passedEverything: boolean,
  ): Promise<ProgressStatus> {
    const existing = await this.prisma.client.progress.findUnique({
      where: { userId_questionId: { userId, questionId } },
      select: { status: true },
    });

    const status: ProgressStatus = passedEverything
      ? 'done'
      : existing?.status === 'done'
        ? 'done'
        : 'in_progress';

    const row = await this.prisma.client.progress.upsert({
      where: { userId_questionId: { userId, questionId } },
      create: { userId, questionId, status, lastAttemptAt: new Date() },
      update: { status, lastAttemptAt: new Date() },
    });
    return row.status;
  }

  async summary(userId: string): Promise<ProgressSummary> {
    const since = startOfDay(new Date(Date.now() - ACTIVITY_DAYS * 86_400_000));

    const [progressRows, submissionRows, recentRows] = await Promise.all([
      this.prisma.client.progress.findMany({
        where: { userId },
        select: { status: true, question: { select: { slug: true } } },
      }),
      this.prisma.client.submission.findMany({
        where: { userId, createdAt: { gte: since } },
        select: { status: true, createdAt: true, question: { select: { slug: true } } },
      }),
      this.prisma.client.submission.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { question: { select: { slug: true } } },
      }),
    ]);

    const statusBySlug = new Map(progressRows.map((row) => [row.question.slug, row.status]));
    const catalogue = this.content.all().map((question) => question.meta);
    const isDone = (slug: string): boolean => statusBySlug.get(slug) === 'done';

    const byDifficulty = DIFFICULTY_ORDER.map((difficulty: Difficulty) => {
      const inGroup = catalogue.filter((meta) => meta.difficulty === difficulty);
      return {
        difficulty,
        total: inGroup.length,
        done: inGroup.filter((meta) => isDone(meta.slug)).length,
      };
    });

    return {
      totals: {
        done: catalogue.filter((meta) => isDone(meta.slug)).length,
        total: catalogue.length,
      },
      byDifficulty,
      byTopic: this.topicProgress(catalogue, isDone, submissionRows),
      activity: this.activity(submissionRows),
      streakDays: this.streak(submissionRows),
      recentSubmissions: recentRows.map(toSubmissionDto),
    };
  }

  /**
   * Per-topic completion plus a failure rate.
   *
   * The failure rate is what drives "weak topics": a topic you keep submitting against and keep
   * failing is more interesting than one you simply have not started.
   */
  private topicProgress(
    catalogue: readonly { slug: string; topics: Topic[] }[],
    isDone: (slug: string) => boolean,
    submissions: readonly { status: string; question: { slug: string } }[],
  ): TopicProgress[] {
    const topicsOf = new Map(catalogue.map((meta) => [meta.slug, meta.topics]));

    return topicSchema.options
      .map((topic): TopicProgress => {
        const inTopic = catalogue.filter((meta) => meta.topics.includes(topic));
        const attempts = submissions.filter((submission) =>
          topicsOf.get(submission.question.slug)?.includes(topic),
        );
        const failed = attempts.filter((submission) => submission.status !== 'passed').length;

        return {
          topic,
          total: inTopic.length,
          done: inTopic.filter((meta) => isDone(meta.slug)).length,
          failureRate: attempts.length > 0 ? failed / attempts.length : 0,
        };
      })
      .filter((entry) => entry.total > 0);
  }

  /** One entry per day that had at least one passing submission, oldest first. */
  private activity(
    submissions: readonly { status: string; createdAt: Date; question: { slug: string } }[],
  ): { date: string; count: number }[] {
    const solvedPerDay = new Map<string, Set<string>>();

    for (const submission of submissions) {
      if (submission.status !== 'passed') continue;
      const day = isoDate(submission.createdAt);
      const set = solvedPerDay.get(day) ?? new Set<string>();
      set.add(submission.question.slug);
      solvedPerDay.set(day, set);
    }

    return [...solvedPerDay.entries()]
      .map(([date, slugs]) => ({ date, count: slugs.size }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Consecutive days ending today that had a passing submission.
   *
   * Today not counting yet must not break the streak — you may simply not have practised yet — so
   * a streak that ends yesterday still counts.
   */
  private streak(submissions: readonly { status: string; createdAt: Date }[]): number {
    const days = new Set(
      submissions.filter((s) => s.status === 'passed').map((s) => isoDate(s.createdAt)),
    );
    if (days.size === 0) return 0;

    const today = startOfDay(new Date());
    let cursor = new Date(today);
    if (!days.has(isoDate(cursor))) {
      cursor = new Date(cursor.getTime() - 86_400_000);
      if (!days.has(isoDate(cursor))) return 0;
    }

    let streak = 0;
    while (days.has(isoDate(cursor))) {
      streak += 1;
      cursor = new Date(cursor.getTime() - 86_400_000);
    }
    return streak;
  }
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function toSubmissionDto(row: {
  id: string;
  question: { slug: string };
  language: string;
  code: string;
  status: string;
  passedCases: number;
  totalCases: number;
  perfPassed: number;
  perfTotal: number;
  durationMs: number;
  mockSessionId: string | null;
  createdAt: Date;
}): Submission {
  return {
    id: row.id,
    questionSlug: row.question.slug,
    language: row.language as Submission['language'],
    code: row.code,
    status: row.status as Submission['status'],
    passedCases: row.passedCases,
    totalCases: row.totalCases,
    perfPassed: row.perfPassed,
    perfTotal: row.perfTotal,
    durationMs: row.durationMs,
    mockSessionId: row.mockSessionId,
    createdAt: row.createdAt.toISOString(),
  };
}
