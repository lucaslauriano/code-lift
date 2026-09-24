/**
 * Vitest global setup: give the e2e suite its own database.
 *
 * Dropped and recreated on every run, so a test never sees a row left behind by a previous run and
 * the development database is never touched.
 */
import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { config } from 'dotenv';
import { Client } from 'pg';

const run = promisify(execFile);
const REPO_ROOT = resolve(__dirname, '../../..');

export default async function setup(): Promise<void> {
  config({ path: resolve(REPO_ROOT, '.env'), quiet: true });

  const testUrl = process.env['TEST_DATABASE_URL'];
  if (!testUrl) throw new Error('TEST_DATABASE_URL is not set — copy .env.example to .env.');

  const url = new URL(testUrl);
  const database = url.pathname.replace(/^\//, '');
  if (!database || database === 'codelift') {
    throw new Error(`TEST_DATABASE_URL must point at a dedicated database, not "${database}".`);
  }

  // Connect to the maintenance database; you cannot drop the database you are connected to.
  const maintenance = new URL(testUrl);
  maintenance.pathname = '/postgres';
  const admin = new Client({ connectionString: maintenance.toString() });

  await admin.connect();
  try {
    await admin.query(`DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`);
    await admin.query(`CREATE DATABASE "${database}"`);
  } finally {
    await admin.end();
  }

  await run('pnpm', ['--filter', '@code-lift/db', 'exec', 'prisma', 'migrate', 'deploy'], {
    cwd: REPO_ROOT,
    env: { ...process.env, DATABASE_URL: testUrl },
  });
}
