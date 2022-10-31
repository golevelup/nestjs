# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.4.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@3.3.0...@golevelup/nestjs-rabbitmq@3.4.0) (2022-10-31)

### Features

- **rabbitmq:** add the option to avoid declaring exchanges ([#506](https://github.com/golevelup/nestjs/issues/506)) ([5c9a78f](https://github.com/golevelup/nestjs/commit/5c9a78fb9d17816650d1adc984d0d9ced2f10fbc))

# [3.3.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@3.2.0...@golevelup/nestjs-rabbitmq@3.3.0) (2022-09-21)

### Bug Fixes

- **rabbitmq:** fix usage of handler config ([#490](https://github.com/golevelup/nestjs/issues/490)) ([241a640](https://github.com/golevelup/nestjs/commit/241a64075e06e15d273994ae786e7d0acec09c31)), closes [#489](https://github.com/golevelup/nestjs/issues/489)
- **rabbitmq:** handle connnection not available issue on RabbitSubscribe and RabbitRPC ([#495](https://github.com/golevelup/nestjs/issues/495)) ([2f2e931](https://github.com/golevelup/nestjs/commit/2f2e93107f14cddac19bac3a7ebda76bf62818ac))

### Features

- **rabbitmq:** add generic type to publish for simple type checking ([#491](https://github.com/golevelup/nestjs/issues/491)) ([45afeb7](https://github.com/golevelup/nestjs/commit/45afeb7ea8b6cc82ff9ccb64afa65fb59c64744d))

# [3.2.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@3.1.0...@golevelup/nestjs-rabbitmq@3.2.0) (2022-07-28)

### Bug Fixes

- **rabbitmq:** properly close the AMQP connections on application shutdown ([cc9ed6d](https://github.com/golevelup/nestjs/commit/cc9ed6dfce03d8c93220b06abd510877a727eb5f)), closes [#482](https://github.com/golevelup/nestjs/issues/482)
- **rabbitmq:** update uuid library using crypto module ([87d67e5](https://github.com/golevelup/nestjs/commit/87d67e5ce3eab621621de484ec8c540d8321939f))

### Features

- **rabbitmq:** Added a new decorator @RabbitHeader() ([b283945](https://github.com/golevelup/nestjs/commit/b283945f5560218478269fab38a892be445574e9))
- **rabbitmq:** better RPC timeout error logs ([8677988](https://github.com/golevelup/nestjs/commit/867798875268d095d074e5802f51cffaf46a982e)), closes [#447](https://github.com/golevelup/nestjs/issues/447)
- **rabbitmq:** new config property "handlers" ([#446](https://github.com/golevelup/nestjs/issues/446)) ([9986b3d](https://github.com/golevelup/nestjs/commit/9986b3d9a79e2e92e71105767501ce8120cd12b6)), closes [#445](https://github.com/golevelup/nestjs/issues/445)

# [3.1.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@3.0.0...@golevelup/nestjs-rabbitmq@3.1.0) (2022-07-22)

### Features

- **rabbitmq:** expose consumer tag for cancel & resume ([3f554c2](https://github.com/golevelup/nestjs/commit/3f554c24edc2896540fee457a6c014983d6f1b82))

# [3.0.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@2.4.1...@golevelup/nestjs-rabbitmq@3.0.0) (2022-07-16)

- feat!(stripe, hasura): named execution contexts ([132c6c5](https://github.com/golevelup/nestjs/commit/132c6c5f6dfe24659e1018b92b85277cad2f1726))

### BREAKING CHANGES

- Switches to using named contexts for stripe and hasura which might have an impact on how interceptors and other NestJS enhancers work with methods that are decorated with the corresponding library handlers

## [2.4.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@2.4.0...@golevelup/nestjs-rabbitmq@2.4.1) (2022-07-16)

**Note:** Version bump only for package @golevelup/nestjs-rabbitmq

# [2.4.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@2.3.0...@golevelup/nestjs-rabbitmq@2.4.0) (2022-05-31)

### Bug Fixes

- **rabbitmq:** abililty to inject connection ([#442](https://github.com/golevelup/nestjs/issues/442)) ([cc49726](https://github.com/golevelup/nestjs/commit/cc4972660c362ee2208d4963b2e15db2968fe6e6)), closes [#430](https://github.com/golevelup/nestjs/issues/430)

### Features

- **connection:** reconsume ([#416](https://github.com/golevelup/nestjs/issues/416)) ([c05297f](https://github.com/golevelup/nestjs/commit/c05297f5e0ac1d991efb0e8c23a0a4821d27aa66)), closes [#415](https://github.com/golevelup/nestjs/issues/415)
- **rabbitmq:** add custom logger to configuration ([#401](https://github.com/golevelup/nestjs/issues/401)) ([242fc69](https://github.com/golevelup/nestjs/commit/242fc69cf00eaf9d5dd6847c1930c0849c0d062a))
- **rabbitmq:** add support for custom message serializer/deserializer ([#443](https://github.com/golevelup/nestjs/issues/443)) ([227f460](https://github.com/golevelup/nestjs/commit/227f4606b4c28fb120caf79feac671c4af084147))
- improve subscriber ([#427](https://github.com/golevelup/nestjs/issues/427)) ([45f68f6](https://github.com/golevelup/nestjs/commit/45f68f68d2dbc01a82e01d2f9e3dedf3242be854))

# [2.3.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@2.2.0...@golevelup/nestjs-rabbitmq@2.3.0) (2022-04-18)

### Bug Fixes

- **rabbitmq:** add void to types of SubscribeResponse ([#407](https://github.com/golevelup/nestjs/issues/407)) ([18ca799](https://github.com/golevelup/nestjs/commit/18ca7996ca66d9681ff763658cfc5256f9d26405)), closes [#396](https://github.com/golevelup/nestjs/issues/396)

### Features

- **rabbitmq:** add support for multiple named connections ([532e2b9](https://github.com/golevelup/nestjs/commit/532e2b9a134d8a27ef6af36c2a71fab7e95c133d))

# [2.2.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@2.1.1...@golevelup/nestjs-rabbitmq@2.2.0) (2022-02-09)

### Features

- **rabbitmq:** enable handler discovery in controllers ([35f3628](https://github.com/golevelup/nestjs/commit/35f36282272918759d2697c4e2fe2a4245f35146)), closes [#369](https://github.com/golevelup/nestjs/issues/369) [#251](https://github.com/golevelup/nestjs/issues/251)

## [2.1.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@2.1.0...@golevelup/nestjs-rabbitmq@2.1.1) (2022-02-04)

### Bug Fixes

- **logging:** use Logger instead of ConsoleLogger ([#388](https://github.com/golevelup/nestjs/issues/388)) ([a0f2597](https://github.com/golevelup/nestjs/commit/a0f2597a3d3522f8003957753ca9b814b47652fd)), closes [#351](https://github.com/golevelup/nestjs/issues/351)

# [2.1.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@2.0.0...@golevelup/nestjs-rabbitmq@2.1.0) (2022-02-01)

### Features

- **rabbitmq:** module lifecycle updates ([#387](https://github.com/golevelup/nestjs/issues/387)) ([4b178b3](https://github.com/golevelup/nestjs/commit/4b178b39d3a2d5600cf705ca3a2b99188ea12fc2)), closes [#386](https://github.com/golevelup/nestjs/issues/386)

# [2.0.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.22.0...@golevelup/nestjs-rabbitmq@2.0.0) (2022-01-24)

- feat!: update libraries to support Nest 8 (#342) ([de7cd35](https://github.com/golevelup/nestjs/commit/de7cd35ac2e63d66af76b792d5bf99b4a2d82bb4)), closes [#342](https://github.com/golevelup/nestjs/issues/342)

### BREAKING CHANGES

- Nest dependencies have been bumped from 6.x -> 8.x and we will no longer be supporting versions older than 8.x for future development

Co-authored-by: Christophe BLIN <cblin@monkeyfactory.fr>
Co-authored-by: danocmx <glencocomaster@centrum.cz>
Co-authored-by: Rodrigo <monstawoodwow@gmail.com>
Co-authored-by: Jesse Carter <jesse.r.carter@gmail.com>

# [1.22.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.21.0...@golevelup/nestjs-rabbitmq@1.22.0) (2022-01-23)

### Features

- **rabbitmq:** message expiration property ([#373](https://github.com/golevelup/nestjs/issues/373)) ([08e2014](https://github.com/golevelup/nestjs/commit/08e2014)), closes [#270](https://github.com/golevelup/nestjs/issues/270)

# [1.21.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.20.1...@golevelup/nestjs-rabbitmq@1.21.0) (2022-01-23)

### Features

- **rabbitmq:** allow setting custom message headers ([#374](https://github.com/golevelup/nestjs/issues/374)) ([d0a2192](https://github.com/golevelup/nestjs/commit/d0a2192)), closes [#372](https://github.com/golevelup/nestjs/issues/372)

## [1.20.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.20.0...@golevelup/nestjs-rabbitmq@1.20.1) (2022-01-20)

### Bug Fixes

- **rabbitmq:** make assertQueueErrorHandler optional ([1a5fd4e](https://github.com/golevelup/nestjs/commit/1a5fd4e)), closes [#364](https://github.com/golevelup/nestjs/issues/364)

# [1.20.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.19.0...@golevelup/nestjs-rabbitmq@1.20.0) (2022-01-19)

### Features

- **rabbitmq:** add support for multiple channels ([01dee85](https://github.com/golevelup/nestjs/commit/01dee85))
- **rabbitmq:** assert queue error handler ([8a8698b](https://github.com/golevelup/nestjs/commit/8a8698b))

# [1.19.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.18.1...@golevelup/nestjs-rabbitmq@1.19.0) (2021-12-17)

### Features

- add option for arguments when binding queue to an exchange ([#346](https://github.com/golevelup/nestjs/issues/346)) ([c561e73](https://github.com/golevelup/nestjs/commit/c561e73)), closes [#343](https://github.com/golevelup/nestjs/issues/343)

## [1.18.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.18.0...@golevelup/nestjs-rabbitmq@1.18.1) (2021-10-30)

### Bug Fixes

- **rabbitmq:** bind queue if routingKey is empty string ([fdac216](https://github.com/golevelup/nestjs/commit/fdac216)), closes [#328](https://github.com/golevelup/nestjs/issues/328)

# [1.18.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.17.1...@golevelup/nestjs-rabbitmq@1.18.0) (2021-10-06)

### Features

- direct queue messaging, optional routing key and exchange ([305922e](https://github.com/golevelup/nestjs/commit/305922e)), closes [#316](https://github.com/golevelup/nestjs/issues/316)

## [1.17.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.17.0...@golevelup/nestjs-rabbitmq@1.17.1) (2021-07-06)

### Bug Fixes

- **rabbitmq:** check buffer has content before trying to parse as JSON ([#286](https://github.com/golevelup/nestjs/issues/286)) ([cfde21e](https://github.com/golevelup/nestjs/commit/cfde21e)), closes [#285](https://github.com/golevelup/nestjs/issues/285)

# [1.17.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.16.2...@golevelup/nestjs-rabbitmq@1.17.0) (2021-06-08)

### Bug Fixes

- **rabbitmq:** add await to publish on reply-to ([59c57ca](https://github.com/golevelup/nestjs/commit/59c57ca))
- **rabbitmq:** prevent unhandled promise rejection warning ([7000d4f](https://github.com/golevelup/nestjs/commit/7000d4f)), closes [#259](https://github.com/golevelup/nestjs/issues/259)

### Features

- **rabbitmq:** log the disconnect event from connection manager ([9fa5708](https://github.com/golevelup/nestjs/commit/9fa5708))

## [1.16.2](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.16.1...@golevelup/nestjs-rabbitmq@1.16.2) (2021-05-17)

**Note:** Version bump only for package @golevelup/nestjs-rabbitmq

## [1.16.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.16.0...@golevelup/nestjs-rabbitmq@1.16.1) (2021-03-26)

**Note:** Version bump only for package @golevelup/nestjs-rabbitmq

# [1.16.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.15.2...@golevelup/nestjs-rabbitmq@1.16.0) (2020-12-08)

### Features

- **rabbitmq:** execution context check utility ([4256a6b](https://github.com/golevelup/nestjs/commit/4256a6b)), closes [#204](https://github.com/golevelup/nestjs/issues/204)
- **rabbitmq:** module shutdown logic ([562b99c](https://github.com/golevelup/nestjs/commit/562b99c)), closes [#193](https://github.com/golevelup/nestjs/issues/193)

## [1.15.2](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.15.1...@golevelup/nestjs-rabbitmq@1.15.2) (2020-10-06)

### Bug Fixes

- **rabbitmq:** error behavior enum ([6b5bc1f](https://github.com/golevelup/nestjs/commit/6b5bc1f)), closes [#187](https://github.com/golevelup/nestjs/issues/187)

## [1.15.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.15.0...@golevelup/nestjs-rabbitmq@1.15.1) (2020-05-13)

**Note:** Version bump only for package @golevelup/nestjs-rabbitmq

# [1.15.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.14.1...@golevelup/nestjs-rabbitmq@1.15.0) (2020-04-16)

### Features

- **rabbitmq:** added error callbacks in favor of error behaviors ([85b1b67](https://github.com/golevelup/nestjs/commit/85b1b67))
- **rabbitmq:** cleanup for error handlers ([ddd4707](https://github.com/golevelup/nestjs/commit/ddd4707))
- **rabbitmq:** error behaviour for replying error ([e438a2a](https://github.com/golevelup/nestjs/commit/e438a2a))
- **rabbitmq:** integration tests, added option for non-json messages ([bc71ffa](https://github.com/golevelup/nestjs/commit/bc71ffa))

## [1.14.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.14.0...@golevelup/nestjs-rabbitmq@1.14.1) (2020-04-04)

**Note:** Version bump only for package @golevelup/nestjs-rabbitmq

# [1.14.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.13.0...@golevelup/nestjs-rabbitmq@1.14.0) (2020-03-28)

### Features

- **common:** injectable decorator factory ([42b2f34](https://github.com/golevelup/nestjs/commit/42b2f34)), closes [#120](https://github.com/golevelup/nestjs/issues/120)

# [1.13.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.12.0...@golevelup/nestjs-rabbitmq@1.13.0) (2020-03-27)

### Features

- **hasura:** event handling service ([09d3f4d](https://github.com/golevelup/nestjs/commit/09d3f4d)), closes [#116](https://github.com/golevelup/nestjs/issues/116)

## [1.12.1-rc.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.12.0...@golevelup/nestjs-rabbitmq@1.12.1-rc.0) (2020-03-27)

### Features

- **hasura:** event handling service ([a98ab7f](https://github.com/golevelup/nestjs/commit/a98ab7f)), closes [#116](https://github.com/golevelup/nestjs/issues/116)

# [1.12.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.11.0...@golevelup/nestjs-rabbitmq@1.12.0) (2020-03-26)

### Features

- **rabbitmq:** optional direct reply-to ([3b7625c](https://github.com/golevelup/nestjs/commit/3b7625c)), closes [#109](https://github.com/golevelup/nestjs/issues/109)

# [1.11.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.10.0...@golevelup/nestjs-rabbitmq@1.11.0) (2020-03-26)

### Features

- **rabbitmq:** add correlationId to request ([81cd0ac](https://github.com/golevelup/nestjs/commit/81cd0ac))

# [1.10.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.9.0...@golevelup/nestjs-rabbitmq@1.10.0) (2020-01-22)

### Features

- **rabbitmq:** enable conditional rpc/subscribe handler registration ([34c5965](https://github.com/golevelup/nestjs/commit/34c5965)), closes [#98](https://github.com/golevelup/nestjs/issues/98)

# [1.9.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.8.1...@golevelup/nestjs-rabbitmq@1.9.0) (2020-01-12)

### Bug Fixes

- **eslint:** add missing eslint dev deps ([7bfcc2c](https://github.com/golevelup/nestjs/commit/7bfcc2c))
- **eslint:** fix sonarcloud diplicate code error ([1868fab](https://github.com/golevelup/nestjs/commit/1868fab))

### Features

- **con-mgmt:** init options,wiki,tests ([8ca3260](https://github.com/golevelup/nestjs/commit/8ca3260))
- **con-mgr:** refactor and fix isConnected usage ([4cafa8a](https://github.com/golevelup/nestjs/commit/4cafa8a))
- **conn-mgr:** add amqp-connection-manager ([0bf5e94](https://github.com/golevelup/nestjs/commit/0bf5e94))
- **conn-mgr:** align tests ([ce79db6](https://github.com/golevelup/nestjs/commit/ce79db6))
- **conn-mgr:** config, events, publish fail ([ad28e86](https://github.com/golevelup/nestjs/commit/ad28e86))
- **conn-mgr:** refactor ([a33b465](https://github.com/golevelup/nestjs/commit/a33b465))
- **conn-mgr:** review fixes, backward compatible ([757e8b3](https://github.com/golevelup/nestjs/commit/757e8b3))
- **conn-mgr:** types + wiki ([82eef04](https://github.com/golevelup/nestjs/commit/82eef04))
- **conn-mgr:** update wiki ([3a9bbd4](https://github.com/golevelup/nestjs/commit/3a9bbd4))
- **conn-mgr:** use connection manager ([9049058](https://github.com/golevelup/nestjs/commit/9049058))

## [1.8.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.8.0...@golevelup/nestjs-rabbitmq@1.8.1) (2020-01-06)

**Note:** Version bump only for package @golevelup/nestjs-rabbitmq

# [1.8.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.7.3...@golevelup/nestjs-rabbitmq@1.8.0) (2019-12-19)

### Features

- **rabbitmq:** add ability to bind handlers to multiple exchange keys ([dd131fe](https://github.com/golevelup/nestjs/commit/dd131fe)), closes [#79](https://github.com/golevelup/nestjs/issues/79)

## [1.7.3](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.7.2...@golevelup/nestjs-rabbitmq@1.7.3) (2019-12-19)

### Bug Fixes

- **rabbitmq:** add missing queue options ([0f37fb6](https://github.com/golevelup/nestjs/commit/0f37fb6))

## [1.7.2](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.7.1...@golevelup/nestjs-rabbitmq@1.7.2) (2019-12-18)

### Bug Fixes

- **rabbitmq:** fix incorrect TS typings ([602cd2d](https://github.com/golevelup/nestjs/commit/602cd2d)), closes [#77](https://github.com/golevelup/nestjs/issues/77)

## [1.7.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.7.0...@golevelup/nestjs-rabbitmq@1.7.1) (2019-12-14)

**Note:** Version bump only for package @golevelup/nestjs-rabbitmq

# [1.7.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.6.0...@golevelup/nestjs-rabbitmq@1.7.0) (2019-11-09)

### Features

- **modules:** udpate create function name to match fit nest terminology ([d3eae4a](https://github.com/golevelup/nestjs/commit/d3eae4a))

# 1.6.0 (2019-11-09)

### Bug Fixes

- **rabbitmq:** added missing dep on @levelup-nestjs/modules ([b9510b3](https://github.com/golevelup/nestjs/commit/b9510b3))

### Features

- **all packages:** upgrade to Nest v6 ([5a8e903](https://github.com/golevelup/nestjs/commit/5a8e903))
- **dynamic modules:** helpers to reduce dynamic module boilerplate ([80a2b2c](https://github.com/golevelup/nestjs/commit/80a2b2c))
- **rabbitmq:** adds additional queue options ([254d79c](https://github.com/golevelup/nestjs/commit/254d79c))
- **rabbitmq:** adds additional queue options for rpc ([d9b9d14](https://github.com/golevelup/nestjs/commit/d9b9d14))
- **rabbitmq:** adds consistent rabbitmq config ([8d6de1d](https://github.com/golevelup/nestjs/commit/8d6de1d)), closes [#34](https://github.com/golevelup/nestjs/issues/34)
- **rabbitmq:** message handling and configuration ([6268eaf](https://github.com/golevelup/nestjs/commit/6268eaf)), closes [#32](https://github.com/golevelup/nestjs/issues/32)

### BREAKING CHANGES

- **all packages:** upgrades underlying nest package dependencies to v6 versions

## [1.5.1-rc.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@1.5.0...@golevelup/nestjs-rabbitmq@1.5.1-rc.0) (2019-11-06)

### Bug Fixes

- **rabbitmq:** added missing dep on @golevelup/nestjs-modules ([b9510b3](https://github.com/golevelup/nestjs/commit/b9510b3))

# 1.5.0 (2019-10-29)

### Features

- **all packages:** upgrade to Nest v6 ([5a8e903](https://github.com/golevelup/nestjs/commit/5a8e903))
- **dynamic modules:** helpers to reduce dynamic module boilerplate ([80a2b2c](https://github.com/golevelup/nestjs/commit/80a2b2c))
- **rabbitmq:** adds additional queue options ([254d79c](https://github.com/golevelup/nestjs/commit/254d79c))
- **rabbitmq:** adds additional queue options for rpc ([d9b9d14](https://github.com/golevelup/nestjs/commit/d9b9d14))
- **rabbitmq:** adds consistent rabbitmq config ([8d6de1d](https://github.com/golevelup/nestjs/commit/8d6de1d)), closes [#34](https://github.com/golevelup/nestjs/issues/34)
- **rabbitmq:** message handling and configuration ([6268eaf](https://github.com/golevelup/nestjs/commit/6268eaf)), closes [#32](https://github.com/golevelup/nestjs/issues/32)

### BREAKING CHANGES

- **all packages:** upgrades underlying nest package dependencies to v6 versions

## [1.4.1](https://github.com/WonderPanda/nestjs-plus/compare/@nestjs-plus/rabbitmq@1.4.0...@nestjs-plus/rabbitmq@1.4.1) (2019-10-06)

**Note:** Version bump only for package @nestjs-plus/rabbitmq

# [1.4.0](https://github.com/WonderPanda/nestjs-plus/compare/@nestjs-plus/rabbitmq@1.3.0...@nestjs-plus/rabbitmq@1.4.0) (2019-10-04)

### Features

- **rabbitmq:** adds additional queue options for rpc ([d9b9d14](https://github.com/WonderPanda/nestjs-plus/commit/d9b9d14))

# [1.3.0](https://github.com/WonderPanda/nestjs-plus/compare/@nestjs-plus/rabbitmq@1.2.0...@nestjs-plus/rabbitmq@1.3.0) (2019-04-19)

### Features

- **rabbitmq:** adds additional queue options ([254d79c](https://github.com/WonderPanda/nestjs-plus/commit/254d79c))

# [1.2.0](https://github.com/WonderPanda/nestjs-plus/compare/@nestjs-plus/rabbitmq@1.1.0...@nestjs-plus/rabbitmq@1.2.0) (2019-04-07)

### Features

- **rabbitmq:** adds consistent rabbitmq config ([8d6de1d](https://github.com/WonderPanda/nestjs-plus/commit/8d6de1d)), closes [#34](https://github.com/WonderPanda/nestjs-plus/issues/34)

# [1.1.0](https://github.com/WonderPanda/nestjs-plus/compare/@nestjs-plus/rabbitmq@1.0.0...@nestjs-plus/rabbitmq@1.1.0) (2019-04-07)

### Features

- **rabbitmq:** message handling and configuration ([6268eaf](https://github.com/WonderPanda/nestjs-plus/commit/6268eaf)), closes [#32](https://github.com/WonderPanda/nestjs-plus/issues/32)

# [1.0.0](https://github.com/WonderPanda/nestjs-plus/compare/@nestjs-plus/rabbitmq@0.2.5...@nestjs-plus/rabbitmq@1.0.0) (2019-03-25)

### Features

- **all packages:** upgrade to Nest v6 ([5a8e903](https://github.com/WonderPanda/nestjs-plus/commit/5a8e903))

### BREAKING CHANGES

- **all packages:** upgrades underlying nest package dependencies to v6 versions
