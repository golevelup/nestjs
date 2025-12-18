# Graphile Worker

Integrate robust background job processing into your NestJS applications with Graphile Worker. 🚀

<div style="display: flex; gap: 10px;">
<a href="https://www.npmjs.com/package/@golevelup/nestjs-graphile-worker"><img src="https://img.shields.io/npm/v/@golevelup/nestjs-graphile-worker.svg?style=flat" alt="version" /></a>
<a href="https://www.npmjs.com/package/@golevelup/nestjs-graphile-worker"><img alt="downloads" src="https://img.shields.io/npm/dt/@golevelup/nestjs-graphile-worker.svg?style=flat"></a>
<img alt="license" src="https://img.shields.io/npm/l/@golevelup/nestjs-graphile-worker.svg">
</div>

## Introduction

**@golevelup/nestjs-graphile-worker** provides seamless integration between [Graphile Worker](https://worker.graphile.org/) and NestJS, allowing you to easily schedule, manage, and process background jobs using PostgreSQL as a reliable job queue. This module enables you to define job handlers using familiar NestJS patterns, making it simple to offload long-running or resource-intensive tasks from your main application flow.

## Who is this for?

If you want a **simple, high-performance job queue** that works with your existing PostgreSQL database—without the operational complexity of Redis-based solutions like BullMQ—this library is for you.  
It's ideal for teams who:

- Prefer to avoid running and maintaining additional infrastructure (like Redis)
- Want a queue that is easy to set up and operate, leveraging the reliability of PostgreSQL
- Need background jobs, scheduled tasks, or event-driven workflows in their NestJS applications
- Value performance and simplicity over feature-bloat

Graphile Worker is a great fit for most use cases where you need background processing, but don't want to introduce unnecessary complexity into your stack.

## Getting Started

```bash [npm]
npm install ---save @golevelup/nestjs-graphile-worker
```

```bash [yarn]
yarn add @golevelup/nestjs-graphile-worker
```

```bash [pnpm]
pnpm add @golevelup/nestjs-graphile-worker
```

## Features

- ⚡ **Simple, high-performance queue:** Leverages your existing PostgreSQL database for job queuing—no need for Redis or extra infrastructure.
- 🏗️ **NestJS-first integration:** Define job handlers as injectable providers using familiar NestJS patterns and dependency injection.
- 🕒 **Background and scheduled jobs:** Easily schedule jobs for immediate or future execution, including recurring tasks.
- 🔄 **Reliable and transactional:** Jobs are persisted and processed reliably, taking advantage of PostgreSQL’s transactional guarantees.
- 🛠️ **Flexible job scheduling:** Schedule jobs from anywhere in your application, with support for custom payloads and priorities.
- 📈 **Scalable processing:** Run multiple workers for parallel job processing and horizontal scaling.
- 🧩 **TypeScript support:** Full TypeScript typings for job payloads and handlers.
- 🛡️ **Runtime payload validation:** Ensure job payloads are valid at runtime using schema validation (e.g., with Zod), increasing safety and reducing runtime errors.
- 🔍 **Minimal operational overhead:** No need to manage additional services—just use your existing database.
- 📦 **Lightweight and fast:** Minimal dependencies and fast job processing, suitable for most background task needs.

---

## Import

Import and add `GraphileWorkerModule` to the `imports` section of your consuming module (most likely `AppModule`). This sets up the Graphile Worker integration and allows you to register job handlers as NestJS providers.

Example:

```typescript
import { Module } from '@nestjs/common';
import { GraphileWorkerModule } from '@golevelup/nestjs-graphile-worker';

@Module({
  imports: [
    GraphileWorkerModule.forRoot({
      connectionString: process.env.DATABASE_URL,
      // ...other options
    }),
  ],
})
export class AppModule {}
```

You can also use `forRootAsync` for dynamic or async configuration, such as loading from a `ConfigService`.

```typescript
GraphileWorkerModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    connectionString: configService.get('DATABASE_URL'),
    // ...other options
  }),
  inject: [ConfigService],
}),
```

**Note** `GraphileWorkerModule` is globally available once registered but you disable that if you'd prefer to bind the module to a specific domain-only.

## Declaring your tasks through Augmentation

To enable strong typing and autocompletion for your job payloads, you should use **TypeScript module augmentation** to extend the `GraphileWorkerTaskSchemas` interface. This allows you to declare your task names and their payload types in a single place, and use Zod schemas for runtime validation—without duplicating types.

**How to declare and infer your tasks:**

1. **Define your Zod schemas**

```typescript
// src/graphile-worker.tasks.ts
import { z } from 'zod';

export const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export const generateReportSchema = z.object({
  reportId: z.string(),
  userId: z.string(),
});
```

2. **Augment the `GraphileWorkerTaskSchemas` interface**

```typescript
// src/graphile-worker.tasks.ts (continued)
declare module '@golevelup/nestjs-graphile-worker' {
  interface GraphileWorkerTaskSchemas {
    sendEmail: z.infer<typeof emailSchema>;
    generateReport: z.infer<typeof generateReportSchema>;
    cron_dailyReport: void; // or you can pass whatever payload
  }
}
```

3. **Register your schemas for runtime validation:**

```typescript
// src/app.module.ts or wherever you configure the module
import { GraphileWorkerModule } from '@golevelup/nestjs-graphile-worker';
import { emailSchema, generateReportSchema } from './graphile-worker.tasks';

GraphileWorkerModule.forRoot({
  // ...other options
  tasksValidationSchemas: {
    sendEmail: emailSchema,
    generateReport: generateReportSchema,
    cron_dailyReport: z.undefined(), // or whatever you'd like as the empty placeholder
  },
});
```

**Benefits:**

- **No duplication:** Types are inferred from your Zod schemas.
- **Type-safe:** Autocompletion and type-checking for all job payloads.
- **Runtime validation:** Use the same schemas for runtime validation and static typing.

With this setup, whenever a `sendEmail` job is processed, the payload will be validated against the `sendEmailSchema` Zod schema. If the validation fails, the job will be rejected with a clear error message, preventing invalid data from causing issues in your application.

## Task handlers

Define your task handlers as injectable providers in NestJS, using the `@GraphileTaskHandler` decorator to handle the job processing logic.

**Example:**

```typescript
import { Injectable } from '@nestjs/common';
import { GraphileTaskHandler } from '@golevelup/nestjs-graphile-worker';
import { generateReportSchema } from './graphile-worker-schemas';
import type { JobHelpers } from 'graphile-worker';

@Injectable()
export class SendEmailProcessor {
  @GraphileTaskHandler({
    name: 'sendEmail',
    // You can also provide additional options such as the queue name, etc etc
  })
  async processJob(
    job: z.infer<typeof generateReportSchema>,
    helpers: JobHelpers,
  ) {
    // job.data contains the validated and typed payload
    console.log(`Sending email to ${job.data.to}`);
    // ...send email logic...
  }
}
```

Because this is a regular injectable service, you can leverage all NestJS features such as `Guards`. You can also perform conditional logic based on the context type by using the `GRAPHILE_WORKER_CONTEXT_TYPE` constant, which we expose to facilitate runtime checks.

This is especially useful when building middleware, interceptors, or guards to enhance your job processing.

## Cron jobs

Graphile Worker supports scheduling recurring jobs using cron syntax. In this NestJS integration, you define cron jobs by creating injectable providers decorated with `@GraphileTaskCron`.

**Example:**

```typescript
import { Injectable } from '@nestjs/common';
import { GraphileTaskCron } from '@golevelup/nestjs-graphile-worker';

@Injectable()
export class GenerateReportCron {
  @GraphileTaskCron({
    name: 'cron_dailyReport',
    match: '* * * * *',
    options: {
      queueName: 'my_dope_reports',
      maxAttempts: 1,
    },
  })
  async handleCron(payload?: YourPayloadTypeIfDefined) {}
}
```

Crons are simply regular tasks therefore payloads are accepted if you schedule this programmatically.

> ℹ️ [Learn more about cron syntax](https://crontab.guru/) and see the [Graphile Worker docs](https://worker.graphile.org/docs/cron) for advanced scheduling options.

## GraphileTaskService

You can use the `GraphileTaskService` to schedule tasks programmatically from anywhere in your NestJS application. This service automatically validates the payload against your registered Zod schemas before enqueuing the job, ensuring only valid data is accepted.

Thanks to TypeScript module augmentation, both the task name and payload are fully type-safe and autocompleted based on your `GraphileWorkerTaskSchemas` interface. This means you get instant feedback and autocompletion for all your defined tasks and their payloads.

**Example:**

```typescript
import { Injectable } from '@nestjs/common';
import { GraphileTaskService } from '@golevelup/nestjs-graphile-worker';

@Injectable()
export class MyService {
  constructor(private readonly tasks: GraphileTaskService) {}

  async sendWelcomeEmail() {
    await this.tasks.scheduleTask('sendEmail', {
      to: 'user@example.com',
      subject: 'Welcome!',
      body: 'Thanks for signing up!',
    });
  }
}
```

- The `scheduleTask` method will only accept valid task names and payloads as defined in your augmentation.
- If the payload does not match the schema, an error is thrown immediately.

This approach ensures robust, type-safe, and validated background job scheduling throughout your application.

## Resources

- https://worker.graphile.org/
- https://zod.dev/
- https://www.typescriptlang.org/docs/handbook/declaration-merging.html
