import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  createSubmissionRequestSchema,
  type CreateSubmissionRequest,
  type CreateSubmissionResponse,
  type SessionUser,
  type Submission,
} from '@code-lift/shared';
import { CurrentUser } from '../common/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { SubmissionsService } from './submissions.service';

@ApiTags('submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Record the result of a run that happened in the browser' })
  create(
    @CurrentUser() user: SessionUser,
    @Body(new ZodValidationPipe(createSubmissionRequestSchema)) body: CreateSubmissionRequest,
  ): Promise<CreateSubmissionResponse> {
    return this.submissions.create(user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Your submissions for one question, newest first' })
  list(
    @CurrentUser() user: SessionUser,
    @Query('questionSlug') questionSlug: string,
  ): Promise<Submission[]> {
    return this.submissions.listForQuestion(user.id, questionSlug);
  }
}
