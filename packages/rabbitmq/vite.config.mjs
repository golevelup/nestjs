/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['**/src/tests/**.spec.ts'],
    globals: false,
  },
});
