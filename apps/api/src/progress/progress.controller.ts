import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  updateProgressRequestSchema,
  type ProgressStatus,
  type ProgressSummary,
  type SessionUser,
  type UpdateProgressRequest,
} from '@code-lift/shared';
import { CurrentUser } from '../common/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ProgressService } from './progress.service';

@ApiTags('progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Dashboard numbers: streak, activity, weak topics, recent submissions' })
  summary(@CurrentUser() user: SessionUser): Promise<ProgressSummary> {
    return this.progress.summary(user.id);
  }

  @Patch(':slug')
  @ApiOperation({ summary: 'Mark a question done or skipped by hand' })
  async update(
    @CurrentUser() user: SessionUser,
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(updateProgressRequestSchema)) body: UpdateProgressRequest,
  ): Promise<{ status: ProgressStatus }> {
    return { status: await this.progress.setStatus(user.id, slug, body.status) };
  }
}
