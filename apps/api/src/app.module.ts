import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
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
      // process.env is the only source, and whoever filled it decides.
      //
      // Letting Nest read the .env file itself would make the file win over process.env, which is
      // how the e2e suite spent its first life quietly running against the development database:
      // the harness set DATABASE_URL to the throwaway database and the file overrode it. Loading
      // the file explicitly — in main.ts for the real app, in the test factory for the suite —
      // makes the precedence obvious instead of a detail of @nestjs/config.
      ignoreEnvFile: true,
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
