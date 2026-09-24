import { Injectable, Logger, NotFoundException, type OnModuleInit } from '@nestjs/common';
import {
  hiddenCases,
  loadAllQuestions,
  publicCases,
  type LoadedQuestion,
} from '@code-lift/content';

/**
 * In-memory view of the question catalogue.
 *
 * Content is files on disk and it cannot change while the process runs, so everything is loaded
 * once at boot. That matters more than it sounds: `cases.ts` is *evaluated* to load, and a
 * performance case builds a 100k-element array — doing that per request would be absurd.
 */
@Injectable()
export class ContentService implements OnModuleInit {
  private readonly logger = new Logger(ContentService.name);
  private readonly bySlug = new Map<string, LoadedQuestion>();

  onModuleInit(): void {
    for (const question of loadAllQuestions()) {
      this.bySlug.set(question.meta.slug, question);
    }
    this.logger.log(`Loaded ${this.bySlug.size} questions from packages/content`);
  }

  all(): LoadedQuestion[] {
    return [...this.bySlug.values()];
  }

  get(slug: string): LoadedQuestion {
    const question = this.bySlug.get(slug);
    if (!question) throw new NotFoundException(`No question with slug "${slug}"`);
    return question;
  }

  has(slug: string): boolean {
    return this.bySlug.has(slug);
  }

  publicCases(slug: string) {
    return publicCases(this.get(slug).cases);
  }

  hiddenCases(slug: string) {
    return hiddenCases(this.get(slug).cases);
  }

  /** Total case count and how it splits, for the workspace header. */
  counts(slug: string): { total: number; public: number; hidden: number; perf: number } {
    const { cases } = this.get(slug);
    return {
      total: cases.length,
      public: cases.filter((testCase) => testCase.hidden !== true).length,
      hidden: cases.filter((testCase) => testCase.hidden === true && testCase.perf !== true).length,
      perf: cases.filter((testCase) => testCase.perf === true).length,
    };
  }
}
