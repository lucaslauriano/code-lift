import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  listQuestionsQuerySchema,
  type ListQuestionsQuery,
  type ListQuestionsResponse,
  type QuestionCases,
  type QuestionDetail,
  type QuestionEditorial,
  type SessionUser,
} from '@code-lift/shared';
import { CurrentUser } from '../common/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { QuestionsService } from './questions.service';

@ApiTags('questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questions: QuestionsService) {}

  @Get()
  @ApiOperation({ summary: 'The catalogue, filtered and joined with your progress' })
  list(
    @CurrentUser() user: SessionUser,
    @Query(new ZodValidationPipe(listQuestionsQuerySchema)) query: ListQuestionsQuery,
  ): Promise<ListQuestionsResponse> {
    return this.questions.list(user.id, query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Everything the workspace needs, minus the answers' })
  detail(@CurrentUser() user: SessionUser, @Param('slug') slug: string): Promise<QuestionDetail> {
    return this.questions.detail(user.id, slug);
  }

  @Get(':slug/cases')
  @ApiOperation({ summary: 'All cases including hidden and performance — fetched on Submit' })
  cases(@Param('slug') slug: string): QuestionCases {
    return this.questions.cases(slug);
  }

  @Get(':slug/editorial')
  @ApiOperation({ summary: 'Reference solution and editorial; locked during a mock session' })
  editorial(
    @CurrentUser() user: SessionUser,
    @Param('slug') slug: string,
  ): Promise<QuestionEditorial> {
    return this.questions.editorial(user.id, slug);
  }
}
