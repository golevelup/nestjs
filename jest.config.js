/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
    '/node_modules/.+/@nestjs/.+\\.js$': '<rootDir>/jest.nest-esm.transform.js',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(\\.pnpm/[^/]+/node_modules/)?@nestjs/)',
  ],
  preset: 'ts-jest',
  testPathIgnorePatterns: [
    '/ts-vitest/',
    '/packages/google-cloud-pubsub/e2e/proto/',
    '/graphile-worker/',
    '/graphql-request/',
    '/stripe/',
    '/webhooks/',
    '/rabbitmq/src/tests/',
    '/discovery/',
  ],
};
