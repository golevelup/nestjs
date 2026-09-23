---
'@golevelup/nestjs-common': minor
'@golevelup/nestjs-discovery': minor
'@golevelup/nestjs-google-cloud-pubsub': minor
'@golevelup/nestjs-hasura': minor
'@golevelup/nestjs-modules': minor
'@golevelup/nestjs-rabbitmq': minor
'@golevelup/nestjs-webhooks': patch
---

Support NestJS 12. The `@nestjs/common` and `@nestjs/core` peer ranges widen from `^11.1.24` to `^11.1.24 || ^12.0.0`, so installing alongside NestJS 12 no longer needs `legacy-peer-deps`.

NestJS 12 is ESM-only, and its exports map does not resolve directory imports. The published type declarations of `nestjs-common`, `nestjs-modules` and `nestjs-webhooks` imported `@nestjs/common/interfaces`, which fails with TS2307 for consumers on `node16`/`nodenext`/`bundler` module resolution. They now import from the `@nestjs/common` root, or from `@nestjs/common/interfaces/index.js` for the two types the root does not export (`RouteInfo`, `HttpArgumentsHost`). Both forms resolve on NestJS 11 and 12.
