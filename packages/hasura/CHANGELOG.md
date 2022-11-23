# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.2](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@3.0.1...@golevelup/nestjs-hasura@3.0.2) (2022-10-31)

### Bug Fixes

- **hasura:** process scheduled events ([#524](https://github.com/golevelup/nestjs/issues/524)) ([cbdc3af](https://github.com/golevelup/nestjs/commit/cbdc3af132ed89df7dd4e72e0afabd2fe96830a1)), closes [/github.com/golevelup/nestjs/blob/master/packages/hasura/src/hasura.module.ts#L175](https://github.com//github.com/golevelup/nestjs/blob/master/packages/hasura/src/hasura.module.ts/issues/L175)

## [3.0.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@3.0.0...@golevelup/nestjs-hasura@3.0.1) (2022-07-28)

**Note:** Version bump only for package @golevelup/nestjs-hasura

# [3.0.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@2.0.4...@golevelup/nestjs-hasura@3.0.0) (2022-07-16)

- feat!(stripe, hasura): named execution contexts ([132c6c5](https://github.com/golevelup/nestjs/commit/132c6c5f6dfe24659e1018b92b85277cad2f1726))

### BREAKING CHANGES

- Switches to using named contexts for stripe and hasura which might have an impact on how interceptors and other NestJS enhancers work with methods that are decorated with the corresponding library handlers

## [2.0.4](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@2.0.3...@golevelup/nestjs-hasura@2.0.4) (2022-07-16)

**Note:** Version bump only for package @golevelup/nestjs-hasura

## [2.0.3](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@2.0.2...@golevelup/nestjs-hasura@2.0.3) (2022-04-18)

**Note:** Version bump only for package @golevelup/nestjs-hasura

## [2.0.2](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@2.0.1...@golevelup/nestjs-hasura@2.0.2) (2022-02-04)

### Bug Fixes

- **logging:** use Logger instead of ConsoleLogger ([#388](https://github.com/golevelup/nestjs/issues/388)) ([a0f2597](https://github.com/golevelup/nestjs/commit/a0f2597a3d3522f8003957753ca9b814b47652fd)), closes [#351](https://github.com/golevelup/nestjs/issues/351)

## [2.0.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@2.0.0...@golevelup/nestjs-hasura@2.0.1) (2022-02-01)

**Note:** Version bump only for package @golevelup/nestjs-hasura

# [2.0.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@1.3.2...@golevelup/nestjs-hasura@2.0.0) (2022-01-24)

- feat!: update libraries to support Nest 8 (#342) ([de7cd35](https://github.com/golevelup/nestjs/commit/de7cd35ac2e63d66af76b792d5bf99b4a2d82bb4)), closes [#342](https://github.com/golevelup/nestjs/issues/342)

### BREAKING CHANGES

- Nest dependencies have been bumped from 6.x -> 8.x and we will no longer be supporting versions older than 8.x for future development

Co-authored-by: Christophe BLIN <cblin@monkeyfactory.fr>
Co-authored-by: danocmx <glencocomaster@centrum.cz>
Co-authored-by: Rodrigo <monstawoodwow@gmail.com>
Co-authored-by: Jesse Carter <jesse.r.carter@gmail.com>

## [1.3.2](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@1.3.1...@golevelup/nestjs-hasura@1.3.2) (2022-01-19)

**Note:** Version bump only for package @golevelup/nestjs-hasura

## [1.3.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@1.3.0...@golevelup/nestjs-hasura@1.3.1) (2021-10-06)

**Note:** Version bump only for package @golevelup/nestjs-hasura

# [1.3.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@1.2.1...@golevelup/nestjs-hasura@1.3.0) (2021-07-06)

### Features

- **hasura:** metadata v3 support ([#284](https://github.com/golevelup/nestjs/issues/284)) ([bcb6fc6](https://github.com/golevelup/nestjs/commit/bcb6fc6)), closes [#250](https://github.com/golevelup/nestjs/issues/250)

## [1.2.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@1.2.0...@golevelup/nestjs-hasura@1.2.1) (2021-05-17)

**Note:** Version bump only for package @golevelup/nestjs-hasura

# [1.2.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@1.1.0...@golevelup/nestjs-hasura@1.2.0) (2021-03-02)

### Features

- **hasura:** allow for custom decorators on controller ([32802e6](https://github.com/golevelup/nestjs/commit/32802e6))

# [1.1.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@1.0.0...@golevelup/nestjs-hasura@1.1.0) (2021-01-16)

### Features

- **hasura:** metadata output property ordering ([9e15b1b](https://github.com/golevelup/nestjs/commit/9e15b1b)), closes [#219](https://github.com/golevelup/nestjs/issues/219)

# [1.0.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@0.6.0...@golevelup/nestjs-hasura@1.0.0) (2020-12-21)

### Features

- **hasura:** managed event and cron triggers ([92b74fa](https://github.com/golevelup/nestjs/commit/92b74fa))

### BREAKING CHANGES

- **hasura:** new format for Hasura module configuration

# [0.6.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@0.5.0...@golevelup/nestjs-hasura@0.6.0) (2020-09-02)

### Features

- **hasura:** scheduled event support ([d677854](https://github.com/golevelup/nestjs/commit/d677854)), closes [#175](https://github.com/golevelup/nestjs/issues/175)

# [0.5.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@0.4.0...@golevelup/nestjs-hasura@0.5.0) (2020-06-10)

### Features

- **hasura:** add HasuraAction type ([0b51c46](https://github.com/golevelup/nestjs/commit/0b51c46))

# [0.4.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@0.3.3...@golevelup/nestjs-hasura@0.4.0) (2020-05-24)

### Bug Fixes

- **hasura:** mismatch on variables ([592b14e](https://github.com/golevelup/nestjs/commit/592b14e))

### Features

- **hasura:** enable event routing based on trigger name ([877462c](https://github.com/golevelup/nestjs/commit/877462c)), closes [#152](https://github.com/golevelup/nestjs/issues/152)

## [0.3.3](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@0.3.2...@golevelup/nestjs-hasura@0.3.3) (2020-05-13)

### Bug Fixes

- **stripe, hasura:** forRootAsync dynamic controllers ([c4d10bf](https://github.com/golevelup/nestjs/commit/c4d10bf)), closes [#148](https://github.com/golevelup/nestjs/issues/148)

## [0.3.1-rc.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@0.3.0...@golevelup/nestjs-hasura@0.3.1-rc.0) (2020-04-08)

### Features

- **stripe:** new stripe package ([ffbcc86](https://github.com/golevelup/nestjs/commit/ffbcc86))

# [0.3.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@0.2.1...@golevelup/nestjs-hasura@0.3.0) (2020-04-05)

### Features

- **hasura:** configurable controller prefix ([15c085c](https://github.com/golevelup/nestjs/commit/15c085c)), closes [#129](https://github.com/golevelup/nestjs/issues/129)

## [0.2.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@0.2.0...@golevelup/nestjs-hasura@0.2.1) (2020-04-04)

**Note:** Version bump only for package @golevelup/nestjs-hasura

# [0.2.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-hasura@0.1.0...@golevelup/nestjs-hasura@0.2.0) (2020-03-28)

### Features

- **common:** injectable decorator factory ([42b2f34](https://github.com/golevelup/nestjs/commit/42b2f34)), closes [#120](https://github.com/golevelup/nestjs/issues/120)

# 0.1.0 (2020-03-27)

### Features

- **graphql-request:** module ([c38ca5d](https://github.com/golevelup/nestjs/commit/c38ca5d))
- **hasura:** event handling service ([09d3f4d](https://github.com/golevelup/nestjs/commit/09d3f4d)), closes [#116](https://github.com/golevelup/nestjs/issues/116)

## 0.0.2-rc.0 (2020-03-27)

### Features

- **hasura:** event handling service ([a98ab7f](https://github.com/golevelup/nestjs/commit/a98ab7f)), closes [#116](https://github.com/golevelup/nestjs/issues/116)
