import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateSubmissionRequest,
  CreateSubmissionResponse,
  Submission,
} from '@code-lift/shared';
import { PrismaService } from '../prisma/prisma.service';
import { ContentService } from '../content/content.service';
import { ProgressService, toSubmissionDto } from '../progress/progress.service';

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly content: ContentService,
    private readonly progress: ProgressService,
  ) {}

  /**
   * Stores the result of a run that happened in the browser.
   *
   * The counts arrive from the client because that is where execution happens, so they are checked
   * against the catalogue rather than trusted: a submission claiming to have passed more cases than
   * the question has is rejected. This is a personal app, so the goal is catching a bug in our own
   * client, not defending against a determined user — who could simply edit the number anyway.
   */
  async create(
    userId: string,
    request: CreateSubmissionRequest,
  ): Promise<CreateSubmissionResponse> {
    const question = await this.prisma.client.question.findUnique({
      where: { slug: request.questionSlug },
      select: { id: true },
    });
    if (!question) throw new NotFoundException(`No synced question "${request.questionSlug}"`);

    const counts = this.content.counts(request.questionSlug);
    if (request.totalCases > counts.total || request.passedCases > request.totalCases) {
      throw new BadRequestException(
        `Case counts are impossible: ${request.passedCases}/${request.totalCases} against a question with ${counts.total} cases.`,
      );
    }
    if (request.perfTotal > counts.perf || request.perfPassed > request.perfTotal) {
      throw new BadRequestException(
        `Performance counts are impossible: ${request.perfPassed}/${request.perfTotal} against ${counts.perf} performance cases.`,
      );
    }

    if (request.mockSessionId) await this.assertSessionIsOpen(userId, request.mockSessionId);

    const row = await this.prisma.client.submission.create({
      data: {
        userId,
        questionId: question.id,
        language: request.language,
        code: request.code,
        status: request.status,
        passedCases: request.passedCases,
        totalCases: request.totalCases,
        perfPassed: request.perfPassed,
        perfTotal: request.perfTotal,
        durationMs: Math.round(request.durationMs),
        mockSessionId: request.mockSessionId ?? null,
      },
      include: { question: { select: { slug: true } } },
    });

    // Only a submit against the full case list can mark a question done.
    const passedEverything =
      request.status === 'passed' &&
      request.totalCases === counts.total &&
      request.passedCases === counts.total;

    const progressStatus = await this.progress.recordSubmission(
      userId,
      question.id,
      passedEverything,
    );

    return { submission: toSubmissionDto(row), progressStatus };
  }

  async listForQuestion(userId: string, slug: string): Promise<Submission[]> {
    const rows = await this.prisma.client.submission.findMany({
      where: { userId, question: { slug } },
      orderBy: { createdAt: 'desc' },
      take: 25,
      include: { question: { select: { slug: true } } },
    });
    return rows.map(toSubmissionDto);
  }

  /** A submission cannot be filed against someone else's session, or one that already closed. */
  private async assertSessionIsOpen(userId: string, mockSessionId: string): Promise<void> {
    const session = await this.prisma.client.mockSession.findFirst({
      where: { id: mockSessionId, userId },
      select: { finishedAt: true, endsAt: true },
    });
    if (!session) throw new NotFoundException('No such mock session');
    if (session.finishedAt !== null) {
      throw new BadRequestException('That mock session is already finished.');
    }
    // A small grace window: the client auto-submits on the timer and the request takes time.
    if (session.endsAt.getTime() + 10_000 < Date.now()) {
      throw new BadRequestException('That mock session has run out of time.');
    }
  }
}
