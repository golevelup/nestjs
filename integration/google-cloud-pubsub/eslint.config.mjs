import prettierPlugin from 'eslint-plugin-prettier';

import baseConfig from '../../eslint.config.mjs';

const baseIgnoreConfig = baseConfig[0] ?? {};
const baseRulesConfig = baseConfig.at(-1) ?? {};

export default [
  {
    ...baseIgnoreConfig,
    ignores: [
      '**/*.d.ts',
      '**/node_modules/',
      '**/*.js',
      'e2e/proto/**/*.ts',
      'integration/google-cloud-pubsub/e2e/proto/**/*.ts',
    ],
  },
  ...baseConfig.slice(1, -1),
  {
    ...baseRulesConfig,
    plugins: {
      ...(baseRulesConfig.plugins ?? {}),
      prettier: prettierPlugin,
    },
    rules: {
      ...(baseRulesConfig.rules ?? {}),
      'prettier/prettier': 'error',
    },
  },
];
