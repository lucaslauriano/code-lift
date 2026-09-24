/**
 * Fills process.env from the repo-root .env, for anything the environment has not already set.
 *
 * This lives in its own module, and `main.ts` imports it *before* AppModule, because import
 * declarations are evaluated in source order while statements in the importing file run last.
 * `ConfigModule.forRoot()` reads and validates the environment as AppModule is evaluated, so a
 * `config()` call in the body of main.ts is too late — the app dies on a missing DATABASE_URL
 * before that line is ever reached.
 *
 * Real environment variables win over the file, which is what a container expects: docker compose
 * passes them in and there is no .env inside the image.
 */
import { resolve } from 'node:path';
import { config } from 'dotenv';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });
