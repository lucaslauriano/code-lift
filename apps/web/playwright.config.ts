import { resolve } from 'node:path';
import { config } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

config({ path: resolve(__dirname, '../../.env'), quiet: true });

const WEB_PORT = process.env['WEB_PORT'] ?? '3010';

/**
 * Runs against servers that are already up.
 *
 * Deliberately not starting them here: the API needs Postgres, migrations and a synced catalogue,
 * and a webServer block that half-starts that stack produces failures that look like product bugs.
 * `pnpm dev` (or `docker compose up`) first, then `pnpm test:e2e`.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
