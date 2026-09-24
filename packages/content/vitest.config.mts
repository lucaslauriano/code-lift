import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Every reference solution runs against its own cases, performance cases included.
    testTimeout: 60_000,
  },
});
