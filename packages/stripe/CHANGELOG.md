# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.5.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-stripe@0.4.1...@golevelup/nestjs-stripe@0.5.0) (2022-09-21)

### Bug Fixes

- **package.json:** add stripe v10 as optional peerDependency ([#503](https://github.com/golevelup/nestjs/issues/503)) ([46ec6fe](https://github.com/golevelup/nestjs/commit/46ec6fece51207b9c952d1615259a44d2696055c)), closes [#502](https://github.com/golevelup/nestjs/issues/502)

### BREAKING CHANGES

- **package.json:** Removed stripe v8 and v9 as peerDependecies. stripe ^10.8.0 is required in
  peerDependencies now

- add stripe as dev dependency

- feat: stripe version update

updates to the latest known version

Co-authored-by: Rodrigo <monstawoodwow@gmail.com>

## [0.4.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-stripe@0.4.0...@golevelup/nestjs-stripe@0.4.1) (2022-07-28)

**Note:** Version bump only for package @golevelup/nestjs-stripe

# [0.4.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-stripe@0.3.4...@golevelup/nestjs-stripe@0.4.0) (2022-07-16)

- feat!(stripe, hasura): named execution contexts ([132c6c5](https://github.com/golevelup/nestjs/commit/132c6c5f6dfe24659e1018b92b85277cad2f1726))

### BREAKING CHANGES

- Switches to using named contexts for stripe and hasura which might have an impact on how interceptors and other NestJS enhancers work with methods that are decorated with the corresponding library handlers

## [0.3.4](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-stripe@0.3.3...@golevelup/nestjs-stripe@0.3.4) (2022-07-16)

**Note:** Version bump only for package @golevelup/nestjs-stripe

## [0.3.3](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-stripe@0.3.2...@golevelup/nestjs-stripe@0.3.3) (2022-04-18)

**Note:** Version bump only for package @golevelup/nestjs-stripe

## [0.3.2](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-stripe@0.3.1...@golevelup/nestjs-stripe@0.3.2) (2022-02-04)

### Bug Fixes

- **logging:** use Logger instead of ConsoleLogger ([#388](https://github.com/golevelup/nestjs/issues/388)) ([a0f2597](https://github.com/golevelup/nestjs/commit/a0f2597a3d3522f8003957753ca9b814b47652fd)), closes [#351](https://github.com/golevelup/nestjs/issues/351)

## [0.3.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-stripe@0.3.0...@golevelup/nestjs-stripe@0.3.1) (2022-02-01)

**Note:** Version bump only for package @golevelup/nestjs-stripe

# [0.3.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-stripe@0.2.3...@golevelup/nestjs-stripe@0.3.0) (2022-01-24)

- feat!: update libraries to support Nest 8 (#342) ([de7cd35](https://github.com/golevelup/nestjs/commit/de7cd35ac2e63d66af76b792d5bf99b4a2d82bb4)), closes [#342](https://github.com/golevelup/nestjs/issues/342)

### BREAKING CHANGES

- Nest dependencies have been bumped from 6.x -> 8.x and we will no longer be supporting versions older than 8.x for future development

Co-authored-by: Christophe BLIN <cblin@monkeyfactory.fr>
Co-authored-by: danocmx <glencocomaster@centrum.cz>
Co-authored-by: Rodrigo <monstawoodwow@gmail.com>
Co-authored-by: Jesse Carter <jesse.r.carter@gmail.com>

## [0.2.3](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-stripe@0.2.2...@golevelup/nestjs-stripe@0.2.3) (2022-01-19)

**Note:** Version bump only for package @golevelup/nestjs-stripe

## [0.2.2](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-stripe@0.2.1...@golevelup/nestjs-stripe@0.2.2) (2021-10-06)

**Note:** Version bump only for package @golevelup/nestjs-stripe

## [0.2.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-stripe@0.2.0...@golevelup/nestjs-stripe@0.2.1) (2021-06-08)

**Note:** Version bump only for package @golevelup/nestjs-stripe

# [0.2.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-stripe@0.1.0...@golevelup/nestjs-stripe@0.2.0) (2021-05-17)

### Features

- **stripe:** add ability to use custom decorators on controller ([ebe8e72](https://github.com/golevelup/nestjs/commit/ebe8e72))

# [0.1.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-stripe@0.0.5...@golevelup/nestjs-stripe@0.1.0) (2020-09-02)

### Features

- **stripe:** restrict event string to valid set ([76d8119](https://github.com/golevelup/nestjs/commit/76d8119)), closes [#170](https://github.com/golevelup/nestjs/issues/170)

## [0.0.5](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-stripe@0.0.4...@golevelup/nestjs-stripe@0.0.5) (2020-05-13)

### Bug Fixes

- **stripe, hasura:** forRootAsync dynamic controllers ([c4d10bf](https://github.com/golevelup/nestjs/commit/c4d10bf)), closes [#148](https://github.com/golevelup/nestjs/issues/148)

## 0.0.1-rc.0 (2020-04-08)

### Features

- **stripe:** new stripe package ([ffbcc86](https://github.com/golevelup/nestjs/commit/ffbcc86))
