import { ForbiddenException, Injectable } from '@nestjs/common';
import type {
  ListQuestionsQuery,
  ListQuestionsResponse,
  QuestionCases,
  QuestionDetail,
  QuestionEditorial,
  QuestionSummary,
} from '@code-lift/shared';
import { PrismaService } from '../prisma/prisma.service';
import { ContentService } from '../content/content.service';
import { MockSessionsService } from '../mock-sessions/mock-sessions.service';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly content: ContentService,
    private readonly mockSessions: MockSessionsService,
  ) {}

  /**
   * The catalogue, joined with this user's progress.
   *
   * Progress and bookmarks are fetched as two whole-table reads rather than per question: the
   * catalogue is small and bounded by what is on disk, so this is two queries instead of 2N.
   */
  async list(userId: string, query: ListQuestionsQuery): Promise<ListQuestionsResponse> {
    const [progressRows, bookmarkRows, questionRows] = await Promise.all([
      this.prisma.client.progress.findMany({
        where: { userId },
        select: { status: true, lastAttemptAt: true, question: { select: { slug: true } } },
      }),
      this.prisma.client.bookmark.findMany({
        where: { userId },
        select: { question: { select: { slug: true } } },
      }),
      this.prisma.client.question.findMany({
        select: { slug: true, isPremium: true, contentVersion: true },
      }),
    ]);

    const progress = new Map(progressRows.map((row) => [row.question.slug, row]));
    const bookmarked = new Set(bookmarkRows.map((row) => row.question.slug));
    const synced = new Map(questionRows.map((row) => [row.slug, row]));

    const search = query.q?.trim().toLowerCase();

    const questions: QuestionSummary[] = this.content
      .all()
      // A question on disk that has never been synced has no id to hang progress off, so it is not
      // listable yet. `pnpm content:sync` is the fix, and the count below makes the gap visible.
      .filter((question) => synced.has(question.meta.slug))
      .map((question) => {
        const { meta, contentVersion } = question;
        const mine = progress.get(meta.slug);
        return {
          ...meta,
          isPremium: synced.get(meta.slug)?.isPremium ?? false,
          contentVersion,
          progressStatus: mine?.status ?? 'todo',
          bookmarked: bookmarked.has(meta.slug),
          lastAttemptAt: mine?.lastAttemptAt?.toISOString() ?? null,
        };
      })
      .filter((question) => {
        if (query.type && question.type !== query.type) return false;
        if (query.difficulty && question.difficulty !== query.difficulty) return false;
        if (query.topic && !question.topics.includes(query.topic)) return false;
        if (query.company && !question.companies.includes(query.company)) return false;
        if (query.status && question.progressStatus !== query.status) return false;
        if (query.bookmarked && !question.bookmarked) return false;
        if (search) {
          const haystack = `${question.title} ${question.summary} ${question.topics.join(' ')}`;
          if (!haystack.toLowerCase().includes(search)) return false;
        }
        return true;
      })
      .sort(byDifficultyThenTitle);

    return { questions, total: questions.length };
  }

  async detail(userId: string, slug: string): Promise<QuestionDetail> {
    const question = this.content.get(slug);
    const counts = this.content.counts(slug);

    const [progress, bookmark] = await Promise.all([
      this.prisma.client.progress.findFirst({
        where: { userId, question: { slug } },
        select: { status: true },
      }),
      this.prisma.client.bookmark.findFirst({
        where: { userId, question: { slug } },
        select: { userId: true },
      }),
    ]);

    return {
      meta: question.meta,
      progressStatus: progress?.status ?? 'todo',
      bookmarked: bookmark !== null,
      prompt: question.prompt,
      starter: question.starter,
      publicCases: this.content.publicCases(slug),
      hiddenCaseCount: counts.hidden,
      perfCaseCount: counts.perf,
    };
  }

  /**
   * Every case, including hidden and performance ones.
   *
   * These reach the browser because that is where submissions run — the whole architecture rests on
   * never executing user code on the server. They are hidden from the UI, not secret.
   */
  cases(slug: string): QuestionCases {
    return { slug, cases: this.content.get(slug).cases };
  }

  /** Withheld while a mock session covering this question is still running. */
  async editorial(userId: string, slug: string): Promise<QuestionEditorial> {
    const question = this.content.get(slug);

    if (await this.mockSessions.isLocked(userId, slug)) {
      throw new ForbiddenException(
        'This question is part of a mock session in progress. The editorial unlocks when the session ends.',
      );
    }

    return { slug, solution: question.solution, editorial: question.editorial };
  }
}

const DIFFICULTY_RANK = { easy: 0, medium: 1, hard: 2 } as const;

function byDifficultyThenTitle(a: QuestionSummary, b: QuestionSummary): number {
  const rank = DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty];
  return rank !== 0 ? rank : a.title.localeCompare(b.title);
}
