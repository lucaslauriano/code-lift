import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { validateEnv } from './config/env';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { ContentModule } from './content/content.module';
import { QuestionsModule } from './questions/questions.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { ProgressModule } from './progress/progress.module';
import { MockSessionsModule } from './mock-sessions/mock-sessions.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // One .env at the repo root, shared by every workspace package.
      envFilePath: resolve(__dirname, '../../../.env'),
      validate: validateEnv,
    }),
    PrismaModule,
    ContentModule,
    AuthModule,
    QuestionsModule,
    SubmissionsModule,
    ProgressModule,
    MockSessionsModule,
  ],
  controllers: [HealthController],
  providers: [
    // Global: a new endpoint is protected unless it says @Public().
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
