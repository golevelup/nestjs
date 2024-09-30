/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{tsconfig: 'tsconfig.spec.json' }],
  },
  preset: "ts-jest",
  testPathIgnorePatterns: [
    "/ts-vitest/"
  ]
};