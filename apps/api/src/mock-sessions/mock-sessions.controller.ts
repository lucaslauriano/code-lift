import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  createMockSessionRequestSchema,
  type ActiveMockSession,
  type CreateMockSessionRequest,
  type MockSession,
  type SessionUser,
} from '@code-lift/shared';
import { CurrentUser } from '../common/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { MockSessionsService } from './mock-sessions.service';

@ApiTags('mock-sessions')
@Controller('mock-sessions')
export class MockSessionsController {
  constructor(private readonly sessions: MockSessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Your recent mock sessions' })
  list(@CurrentUser() user: SessionUser): Promise<MockSession[]> {
    return this.sessions.listForUser(user.id);
  }

  // Declared before ':id' so the literal route is not swallowed by the parameter.
  @Get('active')
  @ApiOperation({ summary: 'The session still running, if any' })
  async active(@CurrentUser() user: SessionUser): Promise<ActiveMockSession> {
    return { session: await this.sessions.active(user.id) };
  }

  @Post()
  @ApiOperation({ summary: 'Start a session — the 90 minute, three question Codility preset' })
  create(
    @CurrentUser() user: SessionUser,
    @Body(new ZodValidationPipe(createMockSessionRequestSchema)) body: CreateMockSessionRequest,
  ): Promise<MockSession> {
    return this.sessions.create(user.id, body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'One session, with its score once it is finished' })
  findOne(@CurrentUser() user: SessionUser, @Param('id') id: string): Promise<MockSession> {
    return this.sessions.findOne(user.id, id);
  }

  @Post(':id/finish')
  @ApiOperation({ summary: 'Close and grade a session; safe to call twice' })
  finish(@CurrentUser() user: SessionUser, @Param('id') id: string): Promise<MockSession> {
    return this.sessions.finish(user.id, id);
  }
}
