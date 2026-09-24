import { Module } from '@nestjs/common';
import { MockSessionsController } from './mock-sessions.controller';
import { MockSessionsService } from './mock-sessions.service';

@Module({
  controllers: [MockSessionsController],
  providers: [MockSessionsService],
  exports: [MockSessionsService],
})
export class MockSessionsModule {}
