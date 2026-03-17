import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    include: ['e2e/**/*.e2e-spec.ts'],
    globalSetup: ['./e2e/setup.ts'],
    pool: 'forks',
    testTimeout: 30000,
    hookTimeout: 30000,
    sequence: {
      concurrent: false,
    },
  },
});
