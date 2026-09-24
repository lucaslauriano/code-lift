import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { MockSession as MockSessionRow, Submission } from '@code-lift/db';
import {
  TOPTAL_CODILITY_PRESET,
  type CreateMockSessionRequest,
  type Difficulty,
  type MockQuestionResult,
  type MockSession,
} from '@code-lift/shared';
import { PrismaService } from '../prisma/prisma.service';
import { ContentService } from '../content/content.service';

/** Correctness is most of the grade; performance is the part an O(N^2) solution loses. */
const CORRECTNESS_WEIGHT = 0.7;
const PERFORMANCE_WEIGHT = 0.3;

@Injectable()
export class MockSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly content: ContentService,
  ) {}

  /**
   * The session the user is in the middle of, if any.
   *
   * Drives two things: resuming after a reload, and withholding the solution and editorial for the
   * questions it covers.
   */
  async active(userId: string): Promise<MockSession | null> {
    const row = await this.prisma.client.mockSession.findFirst({
      where: { userId, finishedAt: null, endsAt: { gt: new Date() } },
      orderBy: { startedAt: 'desc' },
    });
    return row ? await this.toDto(row, null) : null;
  }

  /** True when this question is part of a running session, so its answers must stay hidden. */
  async isLocked(userId: string, slug: string): Promise<boolean> {
    const session = await this.active(userId);
    return session?.questionSlugs.includes(slug) ?? false;
  }

  async create(userId: string, request: CreateMockSessionRequest): Promise<MockSession> {
    const existing = await this.active(userId);
    if (existing) {
      throw new BadRequestException(
        'A mock session is already running. Finish it before starting another.',
      );
    }

    const slugs =
      request.preset === 'custom'
        ? this.validateCustomSlugs(request.questionSlugs)
        : await this.pickPresetSlugs(userId);

    const questionIds = await this.idsForSlugs(slugs);
    const endsAt = new Date(Date.now() + TOPTAL_CODILITY_PRESET.durationMinutes * 60_000);

    const row = await this.prisma.client.mockSession.create({
      data: { userId, preset: request.preset, questionIds, endsAt },
    });

    return await this.toDto(row, null);
  }

  async findOne(userId: string, id: string): Promise<MockSession> {
    const row = await this.prisma.client.mockSession.findFirst({
      where: { id, userId },
      include: { submissions: true },
    });
    if (!row) throw new NotFoundException('No such mock session');

    const results = row.finishedAt ? await this.score(row, row.submissions) : null;
    return await this.toDto(row, results);
  }

  /**
   * Closes the session and grades it.
   *
   * Idempotent: finishing an already-finished session returns the same result rather than
   * re-stamping it, because the client auto-submits on the timer and the user may also click.
   */
  async finish(userId: string, id: string): Promise<MockSession> {
    const row = await this.prisma.client.mockSession.findFirst({
      where: { id, userId },
      include: { submissions: true },
    });
    if (!row) throw new NotFoundException('No such mock session');

    const results = await this.score(row, row.submissions);
    const score = results.length
      ? results.reduce((total, result) => total + result.score, 0) / results.length
      : 0;

    const finished =
      row.finishedAt === null
        ? await this.prisma.client.mockSession.update({
            where: { id },
            data: { finishedAt: new Date(), score },
          })
        : row;

    return await this.toDto(finished, results);
  }

  async listForUser(userId: string): Promise<MockSession[]> {
    const rows = await this.prisma.client.mockSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
    return Promise.all(rows.map((row) => this.toDto(row, null)));
  }

  /**
   * One easy, one medium, one hard, from three different topics, preferring unsolved questions.
   *
   * The catalogue may not contain every difficulty — it currently has no hard questions — so each
   * step falls back rather than failing: a mock with three mediums is still a useful mock.
   */
  private async pickPresetSlugs(userId: string): Promise<string[]> {
    const solved = new Set(
      (
        await this.prisma.client.progress.findMany({
          where: { userId, status: 'done' },
          select: { question: { select: { slug: true } } },
        })
      ).map((row) => row.question.slug),
    );

    const pool = this.content
      .all()
      // Codility track only: a binary tree traversal is a fine question and a terrible thing to
      // meet in a timed Codility rehearsal.
      .filter((question) => question.meta.type === 'algo' && question.meta.track === 'codility')
      .map((question) => question.meta);

    const unsolved = pool.filter((meta) => !solved.has(meta.slug));
    // Everything solved already? Then revising is better than refusing to start.
    const candidates = unsolved.length >= TOPTAL_CODILITY_PRESET.questionCount ? unsolved : pool;

    const chosen: typeof candidates = [];
    const usedTopics = new Set<string>();

    for (const difficulty of TOPTAL_CODILITY_PRESET.difficulties as readonly Difficulty[]) {
      const pick =
        candidates.find(
          (meta) =>
            meta.difficulty === difficulty &&
            !chosen.includes(meta) &&
            meta.topics.every((topic) => !usedTopics.has(topic)),
        ) ??
        candidates.find((meta) => meta.difficulty === difficulty && !chosen.includes(meta)) ??
        candidates.find((meta) => !chosen.includes(meta));

      if (pick) {
        chosen.push(pick);
        for (const topic of pick.topics) usedTopics.add(topic);
      }
    }

    if (chosen.length < TOPTAL_CODILITY_PRESET.questionCount) {
      throw new BadRequestException(
        `The catalogue only has ${chosen.length} usable questions; a mock needs ${TOPTAL_CODILITY_PRESET.questionCount}.`,
      );
    }

    return chosen.map((meta) => meta.slug);
  }

  private validateCustomSlugs(slugs: string[] | undefined): string[] {
    if (!slugs || slugs.length === 0) {
      throw new BadRequestException('A custom mock needs at least one questionSlug.');
    }
    const unknown = slugs.filter((slug) => !this.content.has(slug));
    if (unknown.length > 0) {
      throw new BadRequestException(`Unknown question slugs: ${unknown.join(', ')}`);
    }
    return slugs;
  }

  private async idsForSlugs(slugs: string[]): Promise<string[]> {
    const rows = await this.prisma.client.question.findMany({
      where: { slug: { in: slugs } },
      select: { id: true, slug: true },
    });
    const byslug = new Map(rows.map((row) => [row.slug, row.id]));
    const missing = slugs.filter((slug) => !byslug.has(slug));
    if (missing.length > 0) {
      throw new BadRequestException(
        `These questions are on disk but not synced: ${missing.join(', ')}. Run pnpm content:sync.`,
      );
    }
    return slugs.map((slug) => byslug.get(slug) as string);
  }

  /** Grades each question from the best submission made inside the session. */
  private async score(
    row: MockSessionRow,
    submissions: Submission[],
  ): Promise<MockQuestionResult[]> {
    const slugs = await this.slugsFor(row.questionIds);

    return slugs.map((slug, index) => {
      const questionId = row.questionIds[index] as string;
      const meta = this.content.get(slug).meta;
      const mine = submissions.filter((submission) => submission.questionId === questionId);

      const best = mine.reduce<Submission | null>((winner, candidate) => {
        if (!winner) return candidate;
        const a = candidate.passedCases / Math.max(candidate.totalCases, 1);
        const b = winner.passedCases / Math.max(winner.totalCases, 1);
        return a > b ? candidate : winner;
      }, null);

      if (!best) {
        return {
          questionSlug: slug,
          title: meta.title,
          difficulty: meta.difficulty,
          attempted: false,
          passedCases: 0,
          totalCases: this.content.counts(slug).total,
          perfPassed: 0,
          perfTotal: this.content.counts(slug).perf,
          score: 0,
        };
      }

      const correctness = best.totalCases > 0 ? best.passedCases / best.totalCases : 0;
      // A question with no performance cases is graded on correctness alone rather than being
      // penalised for a dimension it does not have.
      const performance = best.perfTotal > 0 ? best.perfPassed / best.perfTotal : correctness;

      return {
        questionSlug: slug,
        title: meta.title,
        difficulty: meta.difficulty,
        attempted: true,
        passedCases: best.passedCases,
        totalCases: best.totalCases,
        perfPassed: best.perfPassed,
        perfTotal: best.perfTotal,
        score: Math.round(
          (correctness * CORRECTNESS_WEIGHT + performance * PERFORMANCE_WEIGHT) * 100,
        ),
      };
    });
  }

  private async slugsFor(questionIds: string[]): Promise<string[]> {
    const rows = await this.prisma.client.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, slug: true },
    });
    const byId = new Map(rows.map((row) => [row.id, row.slug]));
    return questionIds.map((id) => byId.get(id) ?? id);
  }

  /** The row stores question ids; the API speaks slugs everywhere, so translate on the way out. */
  private async toDto(
    row: MockSessionRow,
    results: MockQuestionResult[] | null,
  ): Promise<MockSession> {
    return {
      id: row.id,
      preset: row.preset,
      questionSlugs: await this.slugsFor(row.questionIds),
      startedAt: row.startedAt.toISOString(),
      endsAt: row.endsAt.toISOString(),
      finishedAt: row.finishedAt?.toISOString() ?? null,
      score: row.score,
      results,
    };
  }
}
