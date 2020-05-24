# @golevelup/nestjs-hasura

Leverage NestJS to make incorporating business logic and event processing easier with Hasura. 🚀

<p align="center">
<a href="https://www.npmjs.com/package/@golevelup/nestjs-hasura"><img src="https://img.shields.io/npm/v/@golevelup/nestjs-hasura.svg?style=flat" alt="version" /></a>
<a href="https://www.npmjs.com/package/@golevelup/nestjs-hasura"><img alt="downloads" src="https://img.shields.io/npm/dt/@golevelup/nestjs-hasura.svg?style=flat"></a>
<img alt="license" src="https://img.shields.io/npm/l/@golevelup/nestjs-hasura.svg">
</p>

## Features

- 🎉 Exposes an API endpoint from your NestJS application at to be used for event processing from Hasura. Defaults to `/hasura/events/` but can be easily configured

- 🔒 Automatically validates that the event payload was actually sent from Hasura using configurable secrets

- 🕵️ Discovers providers from your application decorated with `HasuraEventHandler` and routes incoming events to them

- 🧭 Leverage the table and schema name of the event to route to the appropriate handler

## Usage

### Install

`npm install ---save @golevelup/nestjs-hasura`

or

`yarn add @golevelup/nestjs-hasura`

### Import

Import and add `HasuraModule` to the `imports` section of the consuming module (most likely `AppModule`). In order to ensure that your Hasura events webhook endpoint is secure, the module requires configuration for an HTTP header name and value that will be used to verify that the event actually came from Hasura.

```typescript
import { HasuraModule } from '@golevelup/nestjs-hasura';

@Module({
  imports: [
    HasuraModule.forRoot(HasuraModule, {
      secretFactory: secret,
      secretHeader: secretHeader,
      controllerPrefix: 'something', // this is optional. defaults to hasura
    }),
  ],
})
export class AppModule {
  // ...
}
```

### Configuration

The Hasura Module supports both the `forRoot` and `forRootAsync` patterns for configuration, so you can easily retrieve the necessary config values from a `ConfigService` or other provider.

### Registering Event Handlers

Decorate methods in your NestJS providers in order to have them be automatically attached as event handlers for incoming Hasura events. The event payload will be analyzed and routed to your provider methods based on the configuration provided in the decorator.

#### Route based on Hasura Trigger Name

The recommended method of routing to the correct event handler is to specify the Hasura Trigger Name in the decorator. This will ensure that you have the flexibility to have multiple events targeting the same table with different operation types and column sets.

```typescript
import { HasuraEventHandler, HasuraEvent } from '@golevelup/nestjs-hasura';

@Injectable()
class UsersService {
  @HasuraEventHandler({
    triggerName: 'user_created',
  })
  handleUserCreated(evt: HasuraEvent) {
    // handle the event payload. Typing the method parameter with `HasurEvent` will provide intellisense
  }
}
```

#### Route Based on Schema and Table Name (Deprecated)

It is possible to configure routing to the event handler based on the schema and table name of the source event. This is deprecated and not recommended as it is a less flexible way to route events and will be removed in a future release.

The schema name is optional and if not provided will default to `public`.

For example, to create an event handler for events coming from a `users` table in your database in the `public` schema a method handler could be decorated:

```typescript
import { HasuraEventHandler, HasuraEvent } from '@golevelup/nestjs-hasura';

@Injectable()
class UsersService {
  @HasuraEventHandler({
    table: { name: 'user' },
  })
  handleUserCreated(evt: HasuraEvent) {
    // handle the event payload. Typing the method parameter with `HasurEvent` will provide intellisense
  }
}
```

### Creating Hasura Events

#### Concepts

https://hasura.io/docs/1.0/graphql/manual/event-triggers/index.html#event-triggers

#### Tutorials

https://hasura.io/docs/1.0/graphql/manual/getting-started/first-event-trigger.html
https://hasura.io/event-triggers

#### Integrating with your NestJS app

The `HasuraModule` makes it easy to reuse the same events API endpoint for all events that you create in Hasura. The internal routing mechanism on the NestJS side ensures that the all events coming in through the endpoint will be sent to the correct handler. The endpoint provided defaults to `/hasura/events`. This can be overriden with the module by specifying an alternative `controllerPrefix` so for example you could set this to `webhooks` and the resulting endpoint would be available at `/webhooks/events`.

#### Important!

when creating the event in Hasura, ensure that the Header Name and Value match the configuration provided to the `HasuraModule` configuration in your NestJS application. This ensures that only Hasura can trigger events in your system.

## Contribute

Contributions welcome! Read the [contribution guidelines](../../CONTRIBUTING.md) first.

## License

[MIT License](../../LICENSE)
