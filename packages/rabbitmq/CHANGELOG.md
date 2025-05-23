# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.0.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@6.0.0...@golevelup/nestjs-rabbitmq@6.0.1) (2025-05-22)

### Bug Fixes

- **deps:** rabbitmq nestjs version ([#1037](https://github.com/golevelup/nestjs/issues/1037)) ([79efc2f](https://github.com/golevelup/nestjs/commit/79efc2fbbd35f9e5a5c9ddb6c3ebc1abda454911))

# [6.0.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@5.7.0...@golevelup/nestjs-rabbitmq@6.0.0) (2025-05-08)

### Bug Fixes

- **rabbitmq:** improve URI assertion ([#1020](https://github.com/golevelup/nestjs/issues/1020)) ([baaa6df](https://github.com/golevelup/nestjs/commit/baaa6df4671112a3e99688e20c002a11b13e5271))

### chore

- **dependencies:** updates dependencies ([#1003](https://github.com/golevelup/nestjs/issues/1003)) ([4f78129](https://github.com/golevelup/nestjs/commit/4f78129e347019e63cf5db2d1b9ee0d0a42bc71a))

### BREAKING CHANGES

- **dependencies:** Nestjs v10 is no longer supported from now on

- chore: pnpm-lock update

- chore: update types/express

- chore: update types/lodash

- chore: update supertest

- chore: revert rxjs to 7.8.1

- chore: use mise and update pnpm to latest

- chore: update integration amqlib version

# [5.7.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@5.6.1...@golevelup/nestjs-rabbitmq@5.7.0) (2025-01-24)

### Bug Fixes

- **discovery:** support NestJS 11 ([#945](https://github.com/golevelup/nestjs/issues/945)) ([7617ac1](https://github.com/golevelup/nestjs/commit/7617ac1b603ae6f941d44fdff773c24970bb009a)), closes [#944](https://github.com/golevelup/nestjs/issues/944)
- **rabbitmq:** allow more valid `vhost` names in `assertRabbitMqUri` ([6ca2d16](https://github.com/golevelup/nestjs/commit/6ca2d162ac6c293b7c620a9e493bd2032df8f64b)), closes [#880](https://github.com/golevelup/nestjs/issues/880)

### Features

- improve connection failed error and jsdoc ([#928](https://github.com/golevelup/nestjs/issues/928)) ([862ae3e](https://github.com/golevelup/nestjs/commit/862ae3e4868dc7c711277e5cd620eab1283ccad3))

## [5.6.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@5.6.0...@golevelup/nestjs-rabbitmq@5.6.1) (2024-11-12)

**Note:** Version bump only for package @golevelup/nestjs-rabbitmq

# [5.6.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@5.5.0...@golevelup/nestjs-rabbitmq@5.6.0) (2024-11-06)

### Bug Fixes

- **deps:** fix pnpm dependency issue ([#868](https://github.com/golevelup/nestjs/issues/868)) ([9a02e8b](https://github.com/golevelup/nestjs/commit/9a02e8b31f467d211e333e056a4c4374023a966a)), closes [#817](https://github.com/golevelup/nestjs/issues/817)
- **rmq:** allow pattern to contain empty strings for exact/literal matching ([#794](https://github.com/golevelup/nestjs/issues/794)) ([506cd6d](https://github.com/golevelup/nestjs/commit/506cd6d16d5b678dd5031df567a6383f34206831))

### Features

- add validation for amq connection uri ([#844](https://github.com/golevelup/nestjs/issues/844)) ([af3ac52](https://github.com/golevelup/nestjs/commit/af3ac52045e6893aa4e82f2a16964d4826641c87))
- **rabbitmq:** adds a message batching mechanism for RabbitMQ handlers ([#781](https://github.com/golevelup/nestjs/issues/781)) ([ce44d4d](https://github.com/golevelup/nestjs/commit/ce44d4dfaad05333cacd916c95dbf20089c91790))
- small performance improvement using Map over array ([#795](https://github.com/golevelup/nestjs/issues/795)) ([1b46383](https://github.com/golevelup/nestjs/commit/1b46383766083ac33a0ace970c7d456ebeb2949c))

# [5.5.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@5.4.1...@golevelup/nestjs-rabbitmq@5.5.0) (2024-09-24)

### Features

- add support for named default handler ([#785](https://github.com/golevelup/nestjs/issues/785)) ([b5dec74](https://github.com/golevelup/nestjs/commit/b5dec74549921979b715f1c4a09515172170d19e))

## [5.4.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@5.4.0...@golevelup/nestjs-rabbitmq@5.4.1) (2024-09-03)

### Bug Fixes

- **rabbitmq:** return consumerTag when creating subscriber ([#769](https://github.com/golevelup/nestjs/issues/769)) ([5137c0f](https://github.com/golevelup/nestjs/commit/5137c0f1ea7199695d8695faec745bde2fbc5165)), closes [#755](https://github.com/golevelup/nestjs/issues/755) [#755](https://github.com/golevelup/nestjs/issues/755) [#755](https://github.com/golevelup/nestjs/issues/755)

# [5.4.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@5.3.0...@golevelup/nestjs-rabbitmq@5.4.0) (2024-08-09)

### Features

- **connection.ts:** adds deserializer options to message handlers (closes [#704](https://github.com/golevelup/nestjs/issues/704)) ([#754](https://github.com/golevelup/nestjs/issues/754)) ([9441bdc](https://github.com/golevelup/nestjs/commit/9441bdc24b6a9935fc4a51612a0d8a04b86e03a1))

# [5.3.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@5.2.0...@golevelup/nestjs-rabbitmq@5.3.0) (2024-04-15)

### Features

- **amqp:** add publishOptions to RequestOptions; use them in AmqpConnection.request ([#723](https://github.com/golevelup/nestjs/issues/723)) ([26e9dca](https://github.com/golevelup/nestjs/commit/26e9dcabda08f9f4a22d42baa47d9f97dd43e61e)), closes [#719](https://github.com/golevelup/nestjs/issues/719)

# [5.2.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@5.1.0...@golevelup/nestjs-rabbitmq@5.2.0) (2024-04-10)

### Bug Fixes

- **rabbitmq:** a fix for routing key check. The check should respect wildcards ([#713](https://github.com/golevelup/nestjs/issues/713)) ([735b038](https://github.com/golevelup/nestjs/commit/735b038d7ed9d88488449eb7b568da691ba7af3b)), closes [#712](https://github.com/golevelup/nestjs/issues/712) [#712](https://github.com/golevelup/nestjs/issues/712)

### Features

- **rabbitmq:** handle parallel RPCs response ([#711](https://github.com/golevelup/nestjs/issues/711)) ([d6d70dc](https://github.com/golevelup/nestjs/commit/d6d70dcede095259ce1a1ba43b451163a77f3a0d))

# [5.1.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@5.0.0...@golevelup/nestjs-rabbitmq@5.1.0) (2024-02-20)

### Features

- **rabbitmq:** add graceful shutdown logic ([#697](https://github.com/golevelup/nestjs/issues/697)) ([b0a9aae](https://github.com/golevelup/nestjs/commit/b0a9aae8d57d2325c64859ed014303b7e50d4b1e)), closes [#688](https://github.com/golevelup/nestjs/issues/688)

# [5.0.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@4.1.0...@golevelup/nestjs-rabbitmq@5.0.0) (2024-02-09)

### Bug Fixes

- **rabbitmq:** fix library asserting queues with empty names ([#676](https://github.com/golevelup/nestjs/issues/676)) ([24757f3](https://github.com/golevelup/nestjs/commit/24757f3c226f00c8a708d9a75a098520abd19c0e))
- **rabbitmq:** fix unawaited promises ([#674](https://github.com/golevelup/nestjs/issues/674)) ([4b54afb](https://github.com/golevelup/nestjs/commit/4b54afbb3ca6bfaf5b060e6f0ec49edf20c66238))

### Build System

- **rabbitmq:** update amqp libs ([#677](https://github.com/golevelup/nestjs/issues/677)) ([83530d3](https://github.com/golevelup/nestjs/commit/83530d3444f179fdf32c07acec46d0a2871ee4dd)), closes [#542](https://github.com/golevelup/nestjs/issues/542)

### Features

- **rabbit:** support multiple configs on the same handler ([#682](https://github.com/golevelup/nestjs/issues/682)) ([93ec23f](https://github.com/golevelup/nestjs/commit/93ec23fce4e78fac41fa09255f0141a42abd294b)), closes [#624](https://github.com/golevelup/nestjs/issues/624)
- **rabbitmq:** add exchange-to-exchange bindings config ([#681](https://github.com/golevelup/nestjs/issues/681)) ([20cbdf9](https://github.com/golevelup/nestjs/commit/20cbdf96ff1698d68531c96f9f5ad3c5a521b490)), closes [#625](https://github.com/golevelup/nestjs/issues/625)
- **rabbitmq:** add persistent reply to ([#684](https://github.com/golevelup/nestjs/issues/684)) ([6dfdc1b](https://github.com/golevelup/nestjs/commit/6dfdc1b0f01f10392cb5d6bf6aefaba6a768900e))
- **rabbitmq:** publish using ChannelWrapper ([#678](https://github.com/golevelup/nestjs/issues/678)) ([8962eed](https://github.com/golevelup/nestjs/commit/8962eed4ce527dba11fe7799de58cdf33d066e52)), closes [#673](https://github.com/golevelup/nestjs/issues/673)

### BREAKING CHANGES

- **rabbitmq:** This changes the behavior of throwing connection related errors
- **rabbitmq:** We will no longer emit a disconnect event on an initial connection failure -
  instead we now emit connectFailed on each connection failure, and only emit disconnect when we
  transition from connected to disconnected.

# [4.1.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@4.0.0...@golevelup/nestjs-rabbitmq@4.1.0) (2023-11-21)

### Bug Fixes

- use the Logger passed in config instead of default ([#663](https://github.com/golevelup/nestjs/issues/663)) ([ec69e13](https://github.com/golevelup/nestjs/commit/ec69e1376a97844756a71a7453e2ced9238467d5))
- **rabbitmq:** using **routeArguments** to allow pipe injection ([#648](https://github.com/golevelup/nestjs/issues/648)) ([77b9039](https://github.com/golevelup/nestjs/commit/77b90399302f6f0c986983b3e8ecd5f32dddfa5a))

### Features

- **rabbitmq:** replace defaultRpcErrorBehavior with defaultRpcErrorHandler ([#644](https://github.com/golevelup/nestjs/issues/644)) ([c927cb1](https://github.com/golevelup/nestjs/commit/c927cb12f5203fe4739027fc54d78c6ae2629cfb))

# [4.0.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@3.7.0...@golevelup/nestjs-rabbitmq@4.0.0) (2023-07-18)

- feat(nestjs)!: add support for v10 (#617) ([817729e](https://github.com/golevelup/nestjs/commit/817729ef0fc4d63647430ddac0d011c038b0c36b)), closes [#617](https://github.com/golevelup/nestjs/issues/617)

### Features

- **rabbitmq:** add consumeOption to createSubscriber() ([#535](https://github.com/golevelup/nestjs/issues/535)) ([baeeb2d](https://github.com/golevelup/nestjs/commit/baeeb2db539d968d2a60ede775a5fafce70c8574))
- **rabbitmq:** handle mismatched routing key ([e6d1c08](https://github.com/golevelup/nestjs/commit/e6d1c08caf30cf75a184a1e29bb8e7d6d15f3abd)), closes [#567](https://github.com/golevelup/nestjs/issues/567)

### BREAKING CHANGES

- updating to new major NestJS versions

# [3.7.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@3.6.1...@golevelup/nestjs-rabbitmq@3.7.0) (2023-07-03)

### Features

- **rabbitmq:** support service property to read consumer tags ([#612](https://github.com/golevelup/nestjs/issues/612)) ([37cbb31](https://github.com/golevelup/nestjs/commit/37cbb3140997a14638c07848d3b600b610981168)), closes [#596](https://github.com/golevelup/nestjs/issues/596)

## [3.6.1](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@3.6.0...@golevelup/nestjs-rabbitmq@3.6.1) (2023-06-05)

### Bug Fixes

- **rabbitmq:** race condition for RPC ([efdb4d1](https://github.com/golevelup/nestjs/commit/efdb4d1cf00fdba94ffeebfb75c5224b34f864e8)), closes [#599](https://github.com/golevelup/nestjs/issues/599)

# [3.6.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@3.5.0...@golevelup/nestjs-rabbitmq@3.6.0) (2023-03-28)

### Features

- **rabbitmq:** extend custom parsers, update docs ([5e15faf](https://github.com/golevelup/nestjs/commit/5e15faf2c5e0e079d16c5ebe6c601528f9f658ef)), closes [#574](https://github.com/golevelup/nestjs/issues/574)

# [3.5.0](https://github.com/golevelup/nestjs/compare/@golevelup/nestjs-rabbitmq@3.4.0...@golevelup/nestjs-rabbitmq@3.5.0) (2023-02-23)

### Features

- **rabbitmq:** return promise from publish to be able to await delivery ([#530](https://github.com/golevelup/nestjs/issues/530)) ([7163eca](https://github.com/golevelup/nestjs/commit/7163ecaf948c96b081b803725c023cd75b99002a))

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
