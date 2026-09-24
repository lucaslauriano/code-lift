import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
    testTimeout: 30_000,
    // e2e specs share one Postgres schema; running them in parallel would have them fight over rows.
    fileParallelism: false,
    globalSetup: ['./test/global-setup.ts'],
  },
  plugins: [
    // esbuild (Vitest's default transform) does not emit decorator metadata, which is exactly what
    // Nest's dependency injection reads. SWC does.
    swc.vite({ module: { type: 'es6' } }),
  ],
});
