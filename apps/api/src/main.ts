import 'reflect-metadata';
import { resolve } from 'node:path';
import { config as loadEnvFile } from 'dotenv';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import type { Env } from './config/env';

// Before Nest boots: the one .env at the repo root fills anything the environment has not already
// set. Real environment variables win, which is what a container expects.
loadEnvFile({ path: resolve(__dirname, '../../../.env'), quiet: true });

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<Env, true>);

  app.use(cookieParser());

  // The session lives in a cookie, so the browser must be allowed to send credentials — and that
  // rules out a wildcard origin.
  app.enableCors({
    origin: config.get('WEB_ORIGIN', { infer: true }),
    credentials: true,
  });

  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('code-lift API')
        .setDescription('Personal frontend-interview training platform')
        .setVersion('0.1.0')
        .build(),
    ),
  );

  const port = config.get('API_PORT', { infer: true });
  await app.listen(port, '0.0.0.0');
  new Logger('bootstrap').log(`API on http://localhost:${port} — docs at /docs`);
}

void bootstrap();
