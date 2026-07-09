---
'@golevelup/nestjs-google-cloud-pubsub': major
---

Schema validation now sends a serialized stub message to GCP's `validateMessage` API instead of comparing raw schema definitions. This correctly validates compatibility across all schema revisions and respects the configured encoding (Binary/JSON).

`avsc` and `@protobuf-ts/runtime` are now optional peer dependencies — install only what your schema type requires.

`batchManagerOptions.maxWaitTimeInMillis` has been removed from subscription configuration. Wait time is now derived automatically from `maxMessages` using an adaptive formula (50–500ms range).

**Breaking change:** remove `maxWaitTimeInMillis` from any `batchManagerOptions` configuration.
