# Copilot Instructions for golevelup/nestjs

## Repository Overview

This is a **pnpm monorepo** containing a collection of NestJS modules and utilities. Each package lives under `packages/` and is published independently to npm under the `@golevelup` scope.

### Packages

| Package | Path | Purpose |
|---|---|---|
| `@golevelup/nestjs-common` | `packages/common` | Shared types and mixins |
| `@golevelup/nestjs-discovery` | `packages/discovery` | Find providers, controllers, and handlers by metadata |
| `@golevelup/nestjs-modules` | `packages/modules` | Dynamic module creation helper |
| `@golevelup/nestjs-rabbitmq` | `packages/rabbitmq` | RabbitMQ pub/sub and RPC integration |
| `@golevelup/nestjs-hasura` | `packages/hasura` | Hasura event handler integration |
| `@golevelup/nestjs-graphql-request` | `packages/graphql-request` | GraphQL client dependency injection |
| `@golevelup/nestjs-webhooks` | `packages/webhooks` | Webhook processing middleware |
| `@golevelup/nestjs-stripe` | `packages/stripe` | Stripe client and webhook integration |
| `@golevelup/nestjs-google-cloud-pubsub` | `packages/google-cloud-pubsub` | Google Cloud Pub/Sub integration |
| `@golevelup/nestjs-graphile-worker` | `packages/graphile-worker` | Graphile Worker job queue integration |
| `@golevelup/ts-jest` | `packages/testing/ts-jest` | Jest utilities for NestJS testing |
| `@golevelup/ts-sinon` | `packages/testing/ts-sinon` | Sinon utilities for NestJS testing |
| `@golevelup/ts-vitest` | `packages/testing/ts-vitest` | Vitest utilities for NestJS testing |

## Tech Stack

- **Language:** TypeScript 5.x (strict mode enabled)
- **Framework:** NestJS v11
- **Package manager:** pnpm v10 (workspaces)
- **Monorepo tooling:** Lerna v9 (independent versioning)
- **Unit tests:** Jest v30 with `ts-jest`, or Vitest v4
- **Integration tests:** Jest with `jest-e2e.json` config
- **Linter:** Oxlint
- **Formatter:** Oxfmt
- **Versioning/changelog:** Changesets
- **Commit conventions:** Conventional Commits via Commitizen + CommitLint

## Setup

```bash
pnpm i
```

Running `pnpm i` also registers Git hooks via Husky.

## Build

```bash
# Build all packages (excludes rabbitmq-integration and google-cloud-pubsub-integration)
pnpm build

# Build in watch mode
pnpm build:watch

# Clean build artifacts
pnpm clean
```

## Testing

```bash
# Run all unit tests
pnpm test

# Run unit tests in CI mode (with coverage)
pnpm test:ci

# Run integration tests (requires running RabbitMQ - see docker-compose.yml)
pnpm test:integration

# Run integration tests in CI mode
pnpm test:ci:integration

# Run Vitest unit tests
pnpm test:vitest

# Run Vitest in CI mode with coverage
pnpm test:vitest:ci
```

Integration tests require external services. Use `docker-compose.yml` to start them locally:

```bash
docker compose up -d
```

Environment variables for integration tests:

- `RABBITMQ_HOST` – RabbitMQ hostname (default: `localhost`)
- `RABBITMQ_PORT` – RabbitMQ port (default: `5672`)

## Linting & Formatting

```bash
# Lint
pnpm lint

# Format all files
pnpm format

# Check formatting without modifying files
pnpm format:check
```

## Type Checking

```bash
pnpm lerna:typecheck
```

## Coding Conventions

- All code is **TypeScript** with `strict: true`. Do not disable strict checks.
- Follow existing **NestJS module patterns**: modules export a `DynamicModule` via a static `forRoot()` or `forRootAsync()` method.
- Use **decorators** and **metadata reflection** (`reflect-metadata`) for NestJS integration points.
- Prefer `async/await` over raw Promises or callbacks.
- All new features must include corresponding **unit tests**.
- Tests live alongside source files (e.g., `src/foo.spec.ts`) or in a dedicated `__tests__` directory within the package.
- Do not add new dependencies without checking for existing alternatives already present in the workspace.
- Each package has its own `package.json`. Add package-level dependencies to the correct package, not the root.

## Commit Conventions

Commits must follow the **Conventional Commits** specification. Use the interactive prompt to generate compliant messages:

```bash
pnpm commit
```

Reference issue numbers in the commit footer using `closes #<number>` or `re #<number>`.

Branch naming:

- `feature/{number}-short-description`
- `fix/{number}-short-description`
- `docs/short-description`

## Versioning & Publishing

Versions are managed independently per package using **Changesets**. To create a changeset for your changes:

```bash
pnpm prep-release
```

Do **not** manually edit `package.json` version fields or `CHANGELOG.md` files; let the Changesets tooling handle those.

## CI

The CI pipeline (`.github/workflows/ci.yml`) runs on every pull request and executes:

1. Install dependencies (`pnpm i --prefer-offline`)
2. Build all packages (`pnpm build`)
3. Lint (`pnpm lint`)
4. Type check (`pnpm lerna:typecheck`)
5. Unit tests (`pnpm test:ci`)
6. Vitest tests (`pnpm test:vitest:ci`)
7. Integration tests (`pnpm test:ci:integration`)

All steps must pass before a PR can be merged.

## What Not to Do

- Do **not** modify `pnpm-lock.yaml` directly; let `pnpm i` manage it.
- Do **not** commit build artifacts (`lib/`, `*.tsbuildinfo`) — they are gitignored.
- Do **not** skip or delete existing tests to make a build pass.
- Do **not** introduce breaking changes to public APIs without a corresponding changeset and major version bump.
- Do **not** use `eslint` or `prettier`; this project uses `oxlint` and `oxfmt` instead.
