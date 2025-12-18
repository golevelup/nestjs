/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: [
      // Until we migrate away from ts-jest, we need to add explicit includes
      '**/ts-vitest/src/mocks.spec.ts',
      '**/graphile-worker/src/**.spec.ts',
    ],
    coverage: {
      report: {
        reporter: ['cobertura', 'html'],
      },
      include: [
        '**/ts-vitest/src/mocks.ts',
        '**/graphile-worker/src/**.spec.ts',
      ],
    },
  },
});
