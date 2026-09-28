# @golevelup/nestjs-google-cloud-pubsub

## 3.0.0

### Major Changes

### Schema validation now sends a serialized stub message to GCP's `validateMessage` API instead of comparing raw schema definitions. This correctly validates compatibility across all schema revisions and respects the configured encoding (Binary/JSON).

`avsc` and `@protobuf-ts/runtime` are now optional peer dependencies — install only what your schema type requires.

`batchManagerOptions.maxWaitTimeInMillis` has been removed from subscription configuration. Wait time is now derived automatically from `maxMessages` using an adaptive formula (50–500ms range).

**Breaking change:** remove `maxWaitTimeInMillis` from any `batchManagerOptions` configuration.

### Minor Changes

### Support NestJS 12. The `@nestjs/common` and `@nestjs/core` peer ranges widen from `^11.1.24` to `^11.1.24 || ^12.0.0`, so installing alongside NestJS 12 no longer needs `legacy-peer-deps`.

NestJS 12 is ESM-only, and its exports map does not resolve directory imports. The published type declarations of `nestjs-common`, `nestjs-modules` and `nestjs-webhooks` imported `@nestjs/common/interfaces`, which fails with TS2307 for consumers on `node16`/`nodenext`/`bundler` module resolution. They now import from the `@nestjs/common` root, or from `@nestjs/common/interfaces/index.js` for the two types the root does not export (`RouteInfo`, `HttpArgumentsHost`). Both forms resolve on NestJS 11 and 12.

### Patch Changes

- Updated dependencies: `@golevelup/nestjs-discovery@7.1.0`

## 2.0.0

### Major Changes

- Upgraded TypeScript peer dependency from v4 to v5. Internal tests migrated from Jest to Vitest.

### Patch Changes

- Updated dependencies: `@golevelup/nestjs-discovery@7.0.0`

## 1.2.2

### Patch Changes

- Includes dev dependencies upgrades such as Vite, Vitest and nestjs CLI and a new Stripe upgrade

## 1.2.1

### Patch Changes

- Includes several dependencies upgrades, patch & minor such as Nestjs to its latest version
- Updated dependencies: `@golevelup/nestjs-discovery@6.1.2`

## 1.2.0

### Minor Changes

- introduction of batching, async initialization and centralized documentation

## 1.1.1

### Patch Changes

- An update to the copy README pipeline, relevant to the NPM package profile
- Updated dependencies: `@golevelup/nestjs-discovery@6.1.1`

## 1.1.0

### Minor Changes

- Contains an improvement to the documentation readme copy pipeline

### Patch Changes

- Updated dependencies: `@golevelup/nestjs-discovery@6.1.0`

## 1.0.0

### Major Changes

- Several changes across the new release pipeline including readme files

### Patch Changes

- Updated dependencies: `@golevelup/nestjs-discovery@6.0.0`

## 0.0.1

- Initial release.
