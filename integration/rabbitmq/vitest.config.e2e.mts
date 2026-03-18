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
    server: {
      deps: {
        // amqp-connection-manager is externalized by default; inlining it
        // ensures vi.mock('amqplib', …) applies to its imports too, so that
        // vi.spyOn(amqplib, 'connect') correctly intercepts calls made from
        // within the amqp-connection-manager package during tests.
        inline: ['amqp-connection-manager'],
      },
    },
  },
});
