# Change Log

## 3.0.0

### Major Changes

### **@golevelup/ts-jest**: Limit `DeepMocked` recursion depth to 4 levels to fix type-checking performance regression on complex types (e.g. S3Client, PrismaClient). Fix `RegExp.test` throwing "Cannot convert object to primitive value" on mocked properties by handling `Symbol.toPrimitive`.

**@golevelup/ts-vitest**: Limit `DeepMocked` recursion depth to 4 levels to fix type-checking performance regression on complex types. Fix `RegExp.test` throwing "Cannot convert object to primitive value" on mocked properties by handling `Symbol.toPrimitive`.

**@golevelup/ts-sinon**: Fix `RegExp.test` throwing "Cannot convert object to primitive value" on mocked properties by handling `Symbol.toPrimitive` in the mock proxy.

**@golevelup/nestjs-rabbitmq**: Fix RPC shared queue multiplexing by routing key to prevent message mis-routing. Fix handler `this` context binding for class instances. Add support for per-exchange bindings in `@RabbitSubscribe` via a new `bindings` option.

**@golevelup/nestjs-stripe**: Switch to `constructEventAsync` to fix `SubtleCryptoProvider` errors in Bun and Node 24+. Fix unhandled exception in Sentry global filter when a webhook handler throws. Update default Stripe API version to `2026-02-25.clover`.

## 2.2.0

### Minor Changes

- fixes on a regression caused by the new DeepMocked & type signatures

## 2.1.1

### Patch Changes

- An update to the copy README pipeline, relevant to the NPM package profile

## 2.1.0

### Minor Changes

- Contains an improvement to the documentation readme copy pipeline

## 2.0.0

### Major Changes

- Several changes across the new release pipeline including readme files

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.5.2](https://github.com/golevelup/nestjs/compare/@golevelup/ts-vitest@0.5.1...@golevelup/ts-vitest@0.5.2) (2025-01-24)

**Note:** Version bump only for package @golevelup/ts-vitest

## [0.5.1](https://github.com/golevelup/nestjs/compare/@golevelup/ts-vitest@0.5.0...@golevelup/ts-vitest@0.5.1) (2024-11-06)

**Note:** Version bump only for package @golevelup/ts-vitest

# 0.5.0 (2024-04-10)

### Bug Fixes

- **ts-vitest:** fixed ESM build for ts-vitest ([#706](https://github.com/golevelup/nestjs/issues/706)) ([1da565c](https://github.com/golevelup/nestjs/commit/1da565c29608373d653e39229cf3798c9e7864ff)), closes [#613](https://github.com/golevelup/nestjs/issues/613)

### Features

- **ts-vitest:** added a new package to support vitest for testing utils ([#702](https://github.com/golevelup/nestjs/issues/702)) ([0dc80e5](https://github.com/golevelup/nestjs/commit/0dc80e5b7799d187d3e436a3bc53a9b54bf0d21d)), closes [#613](https://github.com/golevelup/nestjs/issues/613)
