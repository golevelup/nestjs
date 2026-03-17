---
"@golevelup/ts-jest": major
"@golevelup/ts-vitest": major
"@golevelup/ts-sinon": patch
"@golevelup/nestjs-rabbitmq": major
"@golevelup/nestjs-stripe": major
---

**@golevelup/ts-jest**: Limit `DeepMocked` recursion depth to 4 levels to fix type-checking performance regression on complex types (e.g. S3Client, PrismaClient). Fix `RegExp.test` throwing "Cannot convert object to primitive value" on mocked properties by handling `Symbol.toPrimitive`.

**@golevelup/ts-vitest**: Limit `DeepMocked` recursion depth to 4 levels to fix type-checking performance regression on complex types. Fix `RegExp.test` throwing "Cannot convert object to primitive value" on mocked properties by handling `Symbol.toPrimitive`.

**@golevelup/ts-sinon**: Fix `RegExp.test` throwing "Cannot convert object to primitive value" on mocked properties by handling `Symbol.toPrimitive` in the mock proxy.

**@golevelup/nestjs-rabbitmq**: Fix RPC shared queue multiplexing by routing key to prevent message mis-routing. Fix handler `this` context binding for class instances. Add support for per-exchange bindings in `@RabbitSubscribe` via a new `bindings` option.

**@golevelup/nestjs-stripe**: Switch to `constructEventAsync` to fix `SubtleCryptoProvider` errors in Bun and Node 24+. Fix unhandled exception in Sentry global filter when a webhook handler throws. Update default Stripe API version to `2026-02-25.clover`.
