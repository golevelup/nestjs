module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:sonarjs/recommended',
    // 'plugin:prettier/recommended'
  ],
  plugins: ['@typescript-eslint', 'sonarjs'],
  parserOptions: {
    source: 'module',
    ecmaVersion: 2018,
  },
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    'sonarjs/cognitive-complexity': ['error', 20],
    '@typescript-eslint/camelcase': 'off',
  },
  ignorePatterns: ['*.d.ts', 'node_modules/'],
};
