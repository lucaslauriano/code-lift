/**
 * Runs before any test module is imported.
 *
 * It has to be a Vitest setup file rather than a few lines inside the factory, because
 * `ConfigModule.forRoot()` reads and validates the environment *as AppModule is evaluated* — which
 * happens while the factory's own imports are still being resolved, long before any statement in
 * the factory body runs. Setting DATABASE_URL there is too late, and the suite silently connects to
 * whatever the .env file names: the development database.
 */
import { resolve } from 'node:path';
import { config } from 'dotenv';

config({ path: resolve(__dirname, '../../../.env'), quiet: true });

const testUrl = process.env['TEST_DATABASE_URL'];
if (!testUrl) {
  throw new Error('TEST_DATABASE_URL is not set — copy .env.example to .env.');
}
process.env['DATABASE_URL'] = testUrl;
