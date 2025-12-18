/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['**/src/**.spec.ts', '**/src/test/**.spec.ts'],
    globals: false,
  },
});
