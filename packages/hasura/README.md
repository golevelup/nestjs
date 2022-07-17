# @golevelup/nestjs-hasura

Leverage NestJS to make incorporating business logic and event processing easier with Hasura. 🚀

<p align="center">
<a href="https://www.npmjs.com/package/@golevelup/nestjs-hasura"><img src="https://img.shields.io/npm/v/@golevelup/nestjs-hasura.svg?style=flat" alt="version" /></a>
<a href="https://www.npmjs.com/package/@golevelup/nestjs-hasura"><img alt="downloads" src="https://img.shields.io/npm/dt/@golevelup/nestjs-hasura.svg?style=flat"></a>
<img alt="license" src="https://img.shields.io/npm/l/@golevelup/nestjs-hasura.svg">
</p>

- [@golevelup/nestjs-hasura](#golevelupnestjs-hasura)
  - [Features](#features)
  - [Usage](#usage)
    - [Install](#install)
    - [Import](#import)
    - [Configuration](#configuration)
    - [Usage](#usage-1)
      - [Integrating with your NestJS app](#integrating-with-your-nestjs-app)
      - [Automatically Synchronize Hasura Metadata](#automatically-synchronize-hasura-metadata)
      - [Opting Out](#opting-out)
      - [Registering Table Event Handlers](#registering-table-event-handlers)
      - [Registering Scheduled Event Handlers](#registering-scheduled-event-handlers)
      - [Retry Configuration](#retry-configuration)
      - [Configuring Hasura Environment Variables](#configuring-hasura-environment-variables)
      - [Usage with Interceptors, Guards and Filters](#usage-with-interceptors-guards-and-filters)
    - [Related Hasura Documentation](#related-hasura-documentation)
      - [Concepts](#concepts)
      - [Tutorials](#tutorials)
  - [Contribute](#contribute)
  - [License](#license)

## Features

- 🎉 Exposes an API endpoint from your NestJS application at to be used for event processing from Hasura. Defaults to `/hasura/events/` but can be easily configured

- 🔒 Automatically validates that the event payload was actually sent from Hasura using configurable secrets

- 🕵️ Discovers methods from your application and automatically turns them into Hasura event handlers. Supports insert, update and delete events from your tables as well as scheduled events based on a CRON schedule

- 🧭 Routes incoming webhook payloads to the correct event handler based on configuration so you can maintain a single webhook endpoint for Hasura

- 🔌 Optionally supports automatic management of your Hasura metadata files which means that your application code can be the source of truth for configuration of events. This reduces a ton of boilerplate and developer overhead

## Usage

### Install

`npm install ---save @golevelup/nestjs-hasura`

or

`yarn add @golevelup/nestjs-hasura`

### Import

Import and add `HasuraModule` to the `imports` section of the consuming module (most likely `AppModule`). In order to ensure that your Hasura events webhook endpoint is secure, the module requires configuration for an HTTP header name and value that will be used to verify that the event actually came from Hasura.

### Configuration

The Hasura Module supports both the `forRoot` and `forRootAsync` patterns for configuration, so you can easily retrieve the necessary config values from a `ConfigService` or other provider.

### Usage

#### Integrating with your NestJS app

The `HasuraModule` makes it easy to reuse the same events API endpoint for all events that you create in Hasura. The internal routing mechanism on the NestJS side ensures that the all events coming in through the endpoint will be sent to the correct handler. The endpoint provided defaults to `/hasura/events`. This can be overriden with the module by specifying an alternative `controllerPrefix` so for example you could set this to `webhooks` and the resulting endpoint would be available at `/webhooks/events`.

#### Automatically Synchronize Hasura Metadata

One of the more powerful features of this Module is the ability to automatically generate the necessary Hasura metadata for your event handlers instead of having to worry about configuring each handler individually. Under the hood, this uses the [`@hasura/metadata`](https://www.npmjs.com/package/@hasura/metadata) to generate and merge changes to your `tables.yaml` and `cron_triggers.yaml` files.

If you decide to opt into this functionality, you should include the optional `managedMetaDataConfig` object when importing the HasuraModule into your application.

```typescript
import { HasuraModule } from '@golevelup/nestjs-hasura';

@Module({
  imports: [
    HasuraModule.forRoot(HasuraModule, {
      webhookConfig: {
        secretFactory: secret,
        secretHeader: secretHeader,
      },
      managedMetaDataConfig: {
        dirPath: join(process.cwd(), 'hasura/metadata'),
        secretHeaderEnvName: 'HASURA_NESTJS_WEBHOOK_SECRET_HEADER_VALUE',
        nestEndpointEnvName: 'NESTJS_EVENT_WEBHOOK_ENDPOINT',
        defaultEventRetryConfig: {
          intervalInSeconds: 15,
          numRetries: 3,
          timeoutInSeconds: 100,
          toleranceSeconds: 21600,
        },
      },
    }),
  ],
})
export class AppModule {
  // ...
}
```

It is recommended that you conditionally add this configuration based on the Node Environment as this should only be used in development environments to track the necessary changes to your metadata yaml files so that they can be tracked in source control.

After generating changes to these files you should make sure they are applied against your Hasura instance using the CLI command:

```
hasura metadata apply
```

#### Opting Out

If you decide to opt out of automatic metadata synchronization it is up to you to ensure that the secret header name and values match. When creating the event in the Hasura console, you should set these values such that they match the configuration provided to the `HasuraModule` configuration in your NestJS application. This ensures that only Hasura can trigger events in your system.

#### Registering Table Event Handlers

Decorate methods in your NestJS providers in order to have them be automatically attached as event handlers for incoming Hasura events. The event payload will be analyzed and routed to your provider methods based on the configuration provided in the decorator.

```typescript
import {
  TrackedHasuraEventHandler,
  HasuraUpdateEvent,
  HasuraInsertEvent,
} from '@golevelup/nestjs-hasura';

@Injectable()
class UsersService {
  @TrackedHasuraEventHandler({
    triggerName: 'user-created',
    tableName: 'user',
    definition: { type: 'insert' },
  })
  handleUserCreated(evt: HasuraInsertEvent<User>) {}

  @TrackedHasuraEventHandler({
    triggerName: 'user-updated',
    tableName: 'user',
    definition: { type: 'update', columns: ['avatarUrl'] },
  })
  handleUserUpdated(evt: HasuraUpdateEvent<User>) {}
}
```

#### Registering Scheduled Event Handlers

```typescript
import { TrackedHasuraScheduledEventHandler } from '@golevelup/nestjs-hasura';

@Injectable()
class RecurringJobService {
  @TrackedHasuraScheduledEventHandler({
    cronSchedule: CommonCronSchedules.EveryMinute,
    name: 'every-minute',
    payload: {},
    comment: 'this is my comment',
  })
  public async cronTask(evt: any) {
    this.logger.log(evt);
  }
}
```

#### Retry Configuration

Retry configuration for both Table Event handlers as well as Scheduled Event handlers can be configured on the individual decorator or you can provide a default retry configuration at the module level that will be used for any event handler that does not explicitly provide its own retry settings.

#### Configuring Hasura Environment Variables

You should provide ENV variables to your Hasura instance that map the webhook endpoint and secret header values for communication to your NestJS application.

In the examples above, `HASURA_NESTJS_WEBHOOK_SECRET_HEADER_VALUE` and `NESTJS_EVENT_WEBHOOK_ENDPOINT` were used. The webhook endpoint should point to the automatically scaffolded events endpoint eg:
`https://my-nest-app.com/api/hasura/events`

#### Usage with Interceptors, Guards and Filters

This library is built using an underlying NestJS concept called `External Contexts` which allows for methods to be included in the NestJS lifecycle. This means that Guards, Interceptors and Filters (collectively known as "enhancers") can be used in conjunction with Hasura event handlers. However, this can have unwanted/unintended consequences if you are using _Global_ enhancers in your application as these will also apply to all Hasura event handlers. If you were previously expecting all contexts to be regular HTTP contexts, you may need to add conditional logic to prevent your enhancers from applying to Hasura event handlers.

You can identify Hasura event contexts by their context type, `'hasura_event'`:

```typescript
@Injectable()
class ExampleInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const contextType = context.getType<'http' | 'hasura_event'>();

    // Do nothing if this is a Hasura event
    if (contextType === 'hasura_event') {
      return next.handle();
    }

    // Execute custom interceptor logic for HTTP request/response
    return next.handle();
  }
}
```

### Related Hasura Documentation

#### Concepts

https://hasura.io/docs/1.0/graphql/manual/event-triggers/index.html#event-triggers

#### Tutorials

https://hasura.io/docs/1.0/graphql/manual/getting-started/first-event-trigger.html
https://hasura.io/event-triggers

## Contribute

Contributions welcome! Read the [contribution guidelines](../../CONTRIBUTING.md) first.

## License

[MIT License](../../LICENSE)
