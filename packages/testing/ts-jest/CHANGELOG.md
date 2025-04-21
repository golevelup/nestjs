# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.6.2](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.6.1...@golevelup/ts-jest@0.6.2) (2025-01-24)

**Note:** Version bump only for package @golevelup/ts-jest

## [0.6.1](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.6.0...@golevelup/ts-jest@0.6.1) (2024-11-12)

### Bug Fixes

- **ts-jest:** ts-jest: toPrimitive should not be set on proxies, but … ([#879](https://github.com/golevelup/nestjs/issues/879)) ([4188b84](https://github.com/golevelup/nestjs/commit/4188b841a16dd7989866a14d40277cb72508d869))

# [0.6.0](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.5.6...@golevelup/ts-jest@0.6.0) (2024-11-06)

### Bug Fixes

- **ts-jest:** ensures auto mocked properties can be casted to primitive types ([#850](https://github.com/golevelup/nestjs/issues/850)) ([60cc5f8](https://github.com/golevelup/nestjs/commit/60cc5f8f96086ee4621d32a68b7fbaab49733c38)), closes [#843](https://github.com/golevelup/nestjs/issues/843)

### Features

- **rabbitmq:** adds a message batching mechanism for RabbitMQ handlers ([#781](https://github.com/golevelup/nestjs/issues/781)) ([ce44d4d](https://github.com/golevelup/nestjs/commit/ce44d4dfaad05333cacd916c95dbf20089c91790))

## [0.5.6](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.5.5...@golevelup/ts-jest@0.5.6) (2024-09-24)

### Bug Fixes

- fixed nullable mocks issue ([#787](https://github.com/golevelup/nestjs/issues/787)) ([e9560d7](https://github.com/golevelup/nestjs/commit/e9560d7f5f6da3ff215327127733e2d02e89002c)), closes [#757](https://github.com/golevelup/nestjs/issues/757) [#778](https://github.com/golevelup/nestjs/issues/778)

## [0.5.5](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.5.4...@golevelup/ts-jest@0.5.5) (2024-09-03)

### Bug Fixes

- **ts-jest:** asymmetricMatch should be undefined for nested mocks ([3b78f75](https://github.com/golevelup/nestjs/commit/3b78f75d98066d4bc2c4c87bcc60c12a63d8ff8d)), closes [#767](https://github.com/golevelup/nestjs/issues/767)

## [0.5.4](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.5.3...@golevelup/ts-jest@0.5.4) (2024-08-15)

### Bug Fixes

- **ts-jest:** allow setting properties on nested values and overriding cache ([f15bb2e](https://github.com/golevelup/nestjs/commit/f15bb2eb2cc2c2800784ed1dfb25d78c942dbf6d)), closes [#765](https://github.com/golevelup/nestjs/issues/765)

## [0.5.3](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.5.2...@golevelup/ts-jest@0.5.3) (2024-08-14)

### Bug Fixes

- **ts-jest:** toString doesnt work on nested properties of a mock ([#763](https://github.com/golevelup/nestjs/issues/763)) ([a686104](https://github.com/golevelup/nestjs/commit/a686104d0410d9c7ea17ade303aec4312390a6ec)), closes [#762](https://github.com/golevelup/nestjs/issues/762)
- **ts-jest:** update cache when setting mock property ([#756](https://github.com/golevelup/nestjs/issues/756)) ([0756cbc](https://github.com/golevelup/nestjs/commit/0756cbc5caea067b5a1869961135502143472405))

## [0.5.2](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.5.1...@golevelup/ts-jest@0.5.2) (2024-08-12)

### Bug Fixes

- **ts-jest:** fixed nullable mocks issue ([#759](https://github.com/golevelup/nestjs/issues/759)) ([b181b8a](https://github.com/golevelup/nestjs/commit/b181b8aaf3d91302e4fcaaea6f5979499d50ee54)), closes [#757](https://github.com/golevelup/nestjs/issues/757)

## [0.5.1](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.5.0...@golevelup/ts-jest@0.5.1) (2024-08-09)

### Bug Fixes

- **ts-sinon:** fixed match all issue of jest mocks ([#752](https://github.com/golevelup/nestjs/issues/752)) ([9e8fd47](https://github.com/golevelup/nestjs/commit/9e8fd4745f4be90d86794088f92a75bb3f070665))

# [0.5.0](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.4.0...@golevelup/ts-jest@0.5.0) (2024-04-10)

### Features

- **ts-vitest:** added a new package to support vitest for testing utils ([#702](https://github.com/golevelup/nestjs/issues/702)) ([0dc80e5](https://github.com/golevelup/nestjs/commit/0dc80e5b7799d187d3e436a3bc53a9b54bf0d21d)), closes [#613](https://github.com/golevelup/nestjs/issues/613)

# [0.4.0](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.3.8...@golevelup/ts-jest@0.4.0) (2023-07-18)

### Features

- **ts-sinon:** adds new mocking package for sinon users ([#603](https://github.com/golevelup/nestjs/issues/603)) ([4029547](https://github.com/golevelup/nestjs/commit/4029547c241a6a2337d5a381f5374dc4cb88db31))

## [0.3.8](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.3.7...@golevelup/ts-jest@0.3.8) (2023-07-03)

### Bug Fixes

- **testing:** missing jest when injectGlobals=false ([#566](https://github.com/golevelup/nestjs/issues/566)) ([26a681e](https://github.com/golevelup/nestjs/commit/26a681efb2a6ea11979ec6066fc5d12abbb06a40)), closes [/github.com/golevelup/nestjs/issues/557#event-8587363528](https://github.com//github.com/golevelup/nestjs/issues/557/issues/event-8587363528)

## [0.3.7](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.3.6...@golevelup/ts-jest@0.3.7) (2023-05-01)

### Bug Fixes

- **testing:** fix breaking change from 0.3.6 ([33949a9](https://github.com/golevelup/nestjs/commit/33949a98ad8ce55a76a72fb88555998cdcae4859)), closes [#586](https://github.com/golevelup/nestjs/issues/586)

## [0.3.6](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.3.5...@golevelup/ts-jest@0.3.6) (2023-04-28)

### Bug Fixes

- **testing:** support for mocking constructors ([e31d2b3](https://github.com/golevelup/nestjs/commit/e31d2b39c4647fc9e96afa9e68ad41f244e6fc20)), closes [#583](https://github.com/golevelup/nestjs/issues/583)

## [0.3.5](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.3.4...@golevelup/ts-jest@0.3.5) (2023-02-23)

**Note:** Version bump only for package @golevelup/ts-jest

## [0.3.4](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.3.3...@golevelup/ts-jest@0.3.4) (2022-10-31)

### Bug Fixes

- **ts-jest:** unknown property in deep typings issues ([#521](https://github.com/golevelup/nestjs/issues/521)) ([689cb19](https://github.com/golevelup/nestjs/commit/689cb19c6306abe9015842b40caa74bd485ff064))

## [0.3.3](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.3.2...@golevelup/ts-jest@0.3.3) (2022-04-18)

**Note:** Version bump only for package @golevelup/ts-jest

## [0.3.2](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.3.1...@golevelup/ts-jest@0.3.2) (2021-10-30)

**Note:** Version bump only for package @golevelup/ts-jest

## [0.3.1](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.3.0...@golevelup/ts-jest@0.3.1) (2020-12-13)

### Bug Fixes

- **ts-jest:** handling falsy values and undefined ([4152838](https://github.com/golevelup/nestjs/commit/4152838)), closes [#211](https://github.com/golevelup/nestjs/issues/211)

# [0.3.0](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.2.3...@golevelup/ts-jest@0.3.0) (2020-06-10)

### Features

- **ts-jest:** improve support for partials and promises ([82ddac4](https://github.com/golevelup/nestjs/commit/82ddac4))

## [0.2.3](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.2.2...@golevelup/ts-jest@0.2.3) (2020-05-13)

**Note:** Version bump only for package @golevelup/ts-jest

## [0.2.2](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.2.1...@golevelup/ts-jest@0.2.2) (2020-05-11)

**Note:** Version bump only for package @golevelup/ts-jest

## [0.2.1](https://github.com/golevelup/nestjs/compare/@golevelup/ts-jest@0.2.0...@golevelup/ts-jest@0.2.1) (2020-01-12)

### Bug Fixes

- **eslint:** fix sonarcloud diplicate code error ([1868fab](https://github.com/golevelup/nestjs/commit/1868fab))

# 0.2.0 (2019-12-14)

### Bug Fixes

- **mocks:** usage as nestjs providers ([ded433d](https://github.com/golevelup/nestjs/commit/ded433d)), closes [#18](https://github.com/golevelup/nestjs/issues/18)

### Features

- **testing:** new module for testing utilities ([88a7452](https://github.com/golevelup/nestjs/commit/88a7452)), closes [AB#20](https://github.com/AB/issues/20)

## [0.1.2](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-testing@0.1.1...@golevelup/nestjs-testing@0.1.2) (2019-11-13)

### Bug Fixes

- **mocks:** usage as nestjs providers ([ded433d](https://github.com/golevelup/nestjs/commit/ded433d)), closes [#18](https://github.com/golevelup/nestjs/issues/18)

## [0.1.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-testing@0.1.0...@golevelup/nestjs-testing@0.1.1) (2019-11-09)

**Note:** Version bump only for package @golevelup/nestjs-testing

# 0.1.0 (2019-11-09)

### Features

- **testing:** new module for testing utilities ([88a7452](https://github.com/golevelup/nestjs/commit/88a7452)), closes [AB#20](https://github.com/AB/issues/20)

## 0.0.1-rc.0 (2019-11-06)

### Features

- **testing:** new module for testing utilities ([f903c21](https://github.com/golevelup/nestjs/commit/f903c21)), closes [AB#20](https://github.com/AB/issues/20)
