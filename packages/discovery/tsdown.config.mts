import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  dts: true,
  format: {
    esm: {
      target: ['es2015'],
    },
    cjs: {
      target: ['node20'],
    },
  },
});
