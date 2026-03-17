# Change Log

## 1.1.2

### Patch Changes

### **@golevelup/ts-jest**: Limit `DeepMocked` recursion depth to 4 levels to fix type-checking performance regression on complex types (e.g. S3Client, PrismaClient). Fix `RegExp.test` throwing "Cannot convert object to primitive value" on mocked properties by handling `Symbol.toPrimitive`.

**@golevelup/ts-vitest**: Limit `DeepMocked` recursion depth to 4 levels to fix type-checking performance regression on complex types. Fix `RegExp.test` throwing "Cannot convert object to primitive value" on mocked properties by handling `Symbol.toPrimitive`.

**@golevelup/ts-sinon**: Fix `RegExp.test` throwing "Cannot convert object to primitive value" on mocked properties by handling `Symbol.toPrimitive` in the mock proxy.

**@golevelup/nestjs-rabbitmq**: Fix RPC shared queue multiplexing by routing key to prevent message mis-routing. Fix handler `this` context binding for class instances. Add support for per-exchange bindings in `@RabbitSubscribe` via a new `bindings` option.

**@golevelup/nestjs-stripe**: Switch to `constructEventAsync` to fix `SubtleCryptoProvider` errors in Bun and Node 24+. Fix unhandled exception in Sentry global filter when a webhook handler throws. Update default Stripe API version to `2026-02-25.clover`.

## 1.1.1

### Patch Changes

- An update to the copy README pipeline, relevant to the NPM package profile

## 1.1.0

### Minor Changes

- Contains an improvement to the documentation readme copy pipeline

## 1.0.0

### Major Changes

- Several changes across the new release pipeline including readme files

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.1.3](https://github.com/golevelup/nestjs/compare/@golevelup/ts-sinon@0.1.2...@golevelup/ts-sinon@0.1.3) (2025-05-08)

**Note:** Version bump only for package @golevelup/ts-sinon

## [0.1.2](https://github.com/golevelup/nestjs/compare/@golevelup/ts-sinon@0.1.1...@golevelup/ts-sinon@0.1.2) (2025-01-24)

**Note:** Version bump only for package @golevelup/ts-sinon

## [0.1.1](https://github.com/golevelup/nestjs/compare/@golevelup/ts-sinon@0.1.0...@golevelup/ts-sinon@0.1.1) (2024-11-06)

**Note:** Version bump only for package @golevelup/ts-sinon

# 0.1.0 (2023-07-18)

### Features

- **ts-sinon:** adds new mocking package for sinon users ([#603](https://github.com/golevelup/nestjs/issues/603)) ([4029547](https://github.com/golevelup/nestjs/commit/4029547c241a6a2337d5a381f5374dc4cb88db31))
