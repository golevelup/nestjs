# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.7.0](https://github.com/golevelup/nestjs/compare/rabbitmq-integration@2.6.1...rabbitmq-integration@2.7.0) (2022-10-31)

### Features

- **rabbitmq:** add the option to avoid declaring exchanges ([#506](https://github.com/golevelup/nestjs/issues/506)) ([5c9a78f](https://github.com/golevelup/nestjs/commit/5c9a78fb9d17816650d1adc984d0d9ced2f10fbc))

## [2.6.1](https://github.com/golevelup/nestjs/compare/rabbitmq-integration@2.6.0...rabbitmq-integration@2.6.1) (2022-09-21)

### Bug Fixes

- **rabbitmq:** fix usage of handler config ([#490](https://github.com/golevelup/nestjs/issues/490)) ([241a640](https://github.com/golevelup/nestjs/commit/241a64075e06e15d273994ae786e7d0acec09c31)), closes [#489](https://github.com/golevelup/nestjs/issues/489)

# [2.6.0](https://github.com/golevelup/nestjs/compare/rabbitmq-integration@2.5.0...rabbitmq-integration@2.6.0) (2022-07-28)

### Features

- **rabbitmq:** new config property "handlers" ([#446](https://github.com/golevelup/nestjs/issues/446)) ([9986b3d](https://github.com/golevelup/nestjs/commit/9986b3d9a79e2e92e71105767501ce8120cd12b6)), closes [#445](https://github.com/golevelup/nestjs/issues/445)

# [2.5.0](https://github.com/golevelup/nestjs/compare/rabbitmq-integration@2.4.0...rabbitmq-integration@2.5.0) (2022-07-22)

### Features

- **rabbitmq:** expose consumer tag for cancel & resume ([3f554c2](https://github.com/golevelup/nestjs/commit/3f554c24edc2896540fee457a6c014983d6f1b82))

# [2.4.0](https://github.com/golevelup/nestjs/compare/rabbitmq-integration@2.3.0...rabbitmq-integration@2.4.0) (2022-05-31)

### Features

- **rabbitmq:** add support for custom message serializer/deserializer ([#443](https://github.com/golevelup/nestjs/issues/443)) ([227f460](https://github.com/golevelup/nestjs/commit/227f4606b4c28fb120caf79feac671c4af084147))
- improve subscriber ([#427](https://github.com/golevelup/nestjs/issues/427)) ([45f68f6](https://github.com/golevelup/nestjs/commit/45f68f68d2dbc01a82e01d2f9e3dedf3242be854))
- **rabbitmq:** add custom logger to configuration ([#401](https://github.com/golevelup/nestjs/issues/401)) ([242fc69](https://github.com/golevelup/nestjs/commit/242fc69cf00eaf9d5dd6847c1930c0849c0d062a))

# [2.3.0](https://github.com/golevelup/nestjs/compare/rabbitmq-integration@2.2.0...rabbitmq-integration@2.3.0) (2022-04-18)

### Features

- **rabbitmq:** add support for multiple named connections ([532e2b9](https://github.com/golevelup/nestjs/commit/532e2b9a134d8a27ef6af36c2a71fab7e95c133d))

# [2.2.0](https://github.com/golevelup/nestjs/compare/rabbitmq-integration@2.1.0...rabbitmq-integration@2.2.0) (2022-02-09)

### Features

- **rabbitmq:** enable handler discovery in controllers ([35f3628](https://github.com/golevelup/nestjs/commit/35f36282272918759d2697c4e2fe2a4245f35146)), closes [#369](https://github.com/golevelup/nestjs/issues/369) [#251](https://github.com/golevelup/nestjs/issues/251)

# [2.1.0](https://github.com/golevelup/nestjs/compare/rabbitmq-integration@2.0.0...rabbitmq-integration@2.1.0) (2022-02-01)

### Features

- **rabbitmq:** module lifecycle updates ([#387](https://github.com/golevelup/nestjs/issues/387)) ([4b178b3](https://github.com/golevelup/nestjs/commit/4b178b39d3a2d5600cf705ca3a2b99188ea12fc2)), closes [#386](https://github.com/golevelup/nestjs/issues/386)

# 2.0.0 (2022-01-24)

- feat!: update libraries to support Nest 8 (#342) ([de7cd35](https://github.com/golevelup/nestjs/commit/de7cd35ac2e63d66af76b792d5bf99b4a2d82bb4)), closes [#342](https://github.com/golevelup/nestjs/issues/342)

### Bug Fixes

- **dynamic-modules:** incorrectly configured some forRootAsync scenarios ([8560460](https://github.com/golevelup/nestjs/commit/85604602b674cb3a8a27f3ba8284f98ba5e69b74)), closes [AB#8](https://github.com/AB/issues/8)
- **integration:** update integration test packages and fix tests ([1a2a8cb](https://github.com/golevelup/nestjs/commit/1a2a8cbaaf14f27fd7d4259352658cab2eee1eaf))
- **rabbitmq:** bind queue if routingKey is empty string ([fdac216](https://github.com/golevelup/nestjs/commit/fdac2169ba4331f02a89963bce74164b552a6093)), closes [#328](https://github.com/golevelup/nestjs/issues/328)

### Features

- **rabbitmq:** add support for multiple channels ([01dee85](https://github.com/golevelup/nestjs/commit/01dee85f0c64c57f08caab5fd3a21a283bde15cb))
- direct queue messaging, optional routing key and exchange ([305922e](https://github.com/golevelup/nestjs/commit/305922e97453956da0177c44a1415c4720e9db01)), closes [#316](https://github.com/golevelup/nestjs/issues/316)
- **con-mgmt:** init options,wiki,tests ([8ca3260](https://github.com/golevelup/nestjs/commit/8ca32603165bcab3228b573806a3b71ebec4d74f))
- **con-mgr:** refactor and fix isConnected usage ([4cafa8a](https://github.com/golevelup/nestjs/commit/4cafa8a3c7667e79582aa8742c7a5b4ae710f2db))
- **conn-mgr:** align tests ([ce79db6](https://github.com/golevelup/nestjs/commit/ce79db6c9906d461ab2147c1473f81fb61902050))
- **conn-mgr:** review fixes, backward compatible ([757e8b3](https://github.com/golevelup/nestjs/commit/757e8b3deb5dcaecf4844bd1a072bb11da1f16ed))
- **hasura:** event handling service ([09d3f4d](https://github.com/golevelup/nestjs/commit/09d3f4df0a6e5c5d803839df0db81197ddbc9716)), closes [#116](https://github.com/golevelup/nestjs/issues/116)
- **rabbitmq:** add ability to bind handlers to multiple exchange keys ([dd131fe](https://github.com/golevelup/nestjs/commit/dd131feaa4784fe1c6c5192a8feba1a81854e5ea)), closes [#79](https://github.com/golevelup/nestjs/issues/79)
- **rabbitmq:** added error callbacks in favor of error behaviors ([85b1b67](https://github.com/golevelup/nestjs/commit/85b1b67c50a357d6b0d7a5bfc3f1eb281418b391))
- **rabbitmq:** adds consistent rabbitmq config ([8d6de1d](https://github.com/golevelup/nestjs/commit/8d6de1d650d5ecb51aa090b04f27196402957c64)), closes [#34](https://github.com/golevelup/nestjs/issues/34)
- **rabbitmq:** cleanup for error handlers ([ddd4707](https://github.com/golevelup/nestjs/commit/ddd470796eb0787d12cf6e8be32682a213e2eae4))
- **rabbitmq:** enable conditional rpc/subscribe handler registration ([34c5965](https://github.com/golevelup/nestjs/commit/34c5965a8d6b2864d70433562b0497f04490953a)), closes [#98](https://github.com/golevelup/nestjs/issues/98)
- **rabbitmq:** execution context check utility ([4256a6b](https://github.com/golevelup/nestjs/commit/4256a6bfed97ae70102a0d1e418548d1a481b53d)), closes [#204](https://github.com/golevelup/nestjs/issues/204)
- **rabbitmq:** integration tests, added option for non-json messages ([bc71ffa](https://github.com/golevelup/nestjs/commit/bc71ffa45a4ca75146106b6ee3af57e9e17002f0))
- **rabbitmq:** message handling and configuration ([6268eaf](https://github.com/golevelup/nestjs/commit/6268eaf04723b0fcb8ea60cc6c9ae3d79b228cff)), closes [#32](https://github.com/golevelup/nestjs/issues/32)
- **rabbitmq:** optional direct reply-to ([3b7625c](https://github.com/golevelup/nestjs/commit/3b7625c400cfb59643c5fee4ff3e5a84f73aa6ea)), closes [#109](https://github.com/golevelup/nestjs/issues/109)

### BREAKING CHANGES

- Nest dependencies have been bumped from 6.x -> 8.x and we will no longer be supporting versions older than 8.x for future development

Co-authored-by: Christophe BLIN <cblin@monkeyfactory.fr>
Co-authored-by: danocmx <glencocomaster@centrum.cz>
Co-authored-by: Rodrigo <monstawoodwow@gmail.com>
Co-authored-by: Jesse Carter <jesse.r.carter@gmail.com>
