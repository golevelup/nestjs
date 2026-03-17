import { defineConfig } from 'vitest/config';
import { setup, teardown } from './e2e/setup';

export default defineConfig({
  test: {
    globals: false,
    include: ['e2e/**/*.e2e-spec.ts'],
    globalSetup: [{ setup, teardown }],
    pool: 'forks',
    testTimeout: 30000,
    hookTimeout: 30000,
    sequence: {
      concurrent: false,
    },
  },
});
