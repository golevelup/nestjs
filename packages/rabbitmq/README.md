# @golevelup/nestjs-rabbitmq

<p align="center">
<a href="https://www.npmjs.com/package/@golevelup/nestjs-rabbitmq"><img src="https://img.shields.io/npm/v/@golevelup/nestjs-rabbitmq.svg?style=flat" alt="version" /></a>
<a href="https://www.npmjs.com/package/@golevelup/nestjs-rabbitmq"><img alt="downloads" src="https://img.shields.io/npm/dt/@golevelup/nestjs-rabbitmq.svg?style=flat"></a>
<img alt="license" src="https://img.shields.io/npm/l/@golevelup/nestjs-rabbitmq.svg">
</p>

# Table of Contents

- [@golevelup/nestjs-rabbitmq](#golevelupnestjs-rabbitmq)
- [Table of Contents](#table-of-contents)
  - [Description](#description)
  - [Motivation](#motivation)
  - [Connection Management](#connection-management)
  - [Usage](#usage)
    - [Install](#install)
    - [Module Initialization](#module-initialization)
  - [Usage with Interceptors](#usage-with-interceptors)
  - [Receiving Messages](#receiving-messages)
    - [Exposing RPC Handlers](#exposing-rpc-handlers)
    - [Exposing Pub/Sub Handlers](#exposing-pubsub-handlers)
    - [Message Handling](#message-handling)
    - [Conditional Handler Registration](#conditional-handler-registration)
  - [Sending Messages](#sending-messages)
    - [Inject the AmqpConnection](#inject-the-amqpconnection)
    - [Publising Messages (Fire and Forget)](#publising-messages-fire-and-forget)
    - [Requesting Data from an RPC](#requesting-data-from-an-rpc)
      - [Type Inference](#type-inference)
      - [Interop with other RPC Servers](#interop-with-other-rpc-servers)
  - [Advanced Patterns](#advanced-patterns)
    - [Competing Consumers](#competing-consumers)
  - [Contribute](#contribute)
  - [License](#license)

## Description

This module features an opinionated set of decorators for common RabbitMQ patterns including Publish/Subscribe and RPC using Rabbit's [Direct Reply-To Queue](https://www.rabbitmq.com/direct-reply-to.html) for optimal performance.

It allows you to expose normal NestJS service methods as messaging handlers that can be configured to support a variety of messaging patterns.

## Motivation

NestJS offers an out of the box microservices experience with support for a variety of transports. However, because NestJS microservices strives to work with a variety of transport mechanisms in a generic way, it misses out on some of the powerful functionality offered by individual transport layers.

Some of the most notable missing functionality includes common messaging patterns like publish/subscribe and competing consumers.

## Connection Management

In previous versions, this package did not support advanced connection management and if you tried to launch the app when a connection could not be established, an error was thrown and caused the app to crash.

Now, this package leverages [`amqp-connection-manager`](https://github.com/benbria/node-amqp-connection-manager) package to support connection resiliency.

**NOTE**: to maintain the same pervious behavior and not introduce a major version update, the previous behavior is still the default.

If you want to transition to the new behavior and enable connection resiliency, you can configure `connectionInitOptions` to not wait for a connection to be availble, for example:

```typescript
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'exchange1',
          type: 'topic',
        },
      ],
      uri: 'amqp://rabbitmq:rabbitmq@localhost:5672',
      connectionInitOptions: { wait: false },
    }),
  ],
})
export class RabbitExampleModule {}
```

With the new behavior in place, unavailability of a RabbitMQ broker still allows your application to bootstrap correctly and relevant channel setups take place whenever a connection can be established.

The same principle applies to when a connection is lost. In such cases, the module tries to reconnect and set up everything again once it is reconnected.

## Usage

### Install

`npm install ---save @golevelup/nestjs-rabbitmq`

or

`yarn add @golevelup/nestjs-rabbitmq`

### Module Initialization

Import and add `RabbitMQModule` it to the `imports` array of module for which you would like to discover handlers. It may make sense for your application to do this in a shared module or to re-export it so it can be used across modules more easily. [Refer to the NestJS docs on modules for more information.](https://docs.nestjs.com/modules)

If you are using exchanges, provide information about them to the module and they will be automatically asserted for you as part of initialization. If you don't, it's possible message passing will fail if an exchange is addressed that hasn't been created yet.

```typescript
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { MessagingController } from './messaging/messaging.controller';
import { MessagingService } from './messaging/messaging.service';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'exchange1',
          type: 'topic',
        },
      ],
      uri: 'amqp://rabbitmq:rabbitmq@localhost:5672',
    }),
    RabbitExampleModule,
  ],
  providers: [MessagingService],
  controllers: [MessagingController],
})
export class RabbitExampleModule {}
```

## Usage with Interceptors

This library is built using an underlying NestJS concept called `External Contexts` which allows for methods to be included in the NestJS lifecycle. This means that Guards and Interceptors can be used in conjunction with RabbitMQ message handlers. However, this can have unwanted/unintended consequences if you are using Global intereceptors in your application as these will also apply to all RabbitMQ message handlers. As a workaround, there is a utiltity function available called `isRabbitContext` which you can use inside of Interceptors to do conditional logic.

```typescript
import { isRabbitContext } from '@golevelup/nestjs-rabbitmq';

@Injectable()
class ExampleInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const shouldSkip = isRabbitContext(context);
    if (shouldSkip) {
      return next.handle();
    }

    // Execute custom interceptor logic for HTTP request/response
    return next.handle();
  }
}
```

## Receiving Messages

### Exposing RPC Handlers

Simply apply the `RabbitRPC` decorator to a new or existing NestJS service class. When a message matching the exchange and routing key is received over RabbitMQ, the result of the Service method will be automatically sent back to the requester using the [Direct Reply-To Queue](https://www.rabbitmq.com/direct-reply-to.html).

```typescript
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagingService {
  @RabbitRPC({
    exchange: 'exchange1',
    routingKey: 'rpc-route',
    queue: 'rpc-queue',
  })
  public async rpcHandler(msg: {}) {
    return {
      response: 42,
    };
  }
}
```

### Exposing Pub/Sub Handlers

Simply apply the `RabbitSubscribe` decorator to a new or existing NestJS service class. When a message matching the exchange and routing key is received over RabbitMQ, the service method will automatically be invoked with the message allowing it to be handled as necessary.

```typescript
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagingService {
  @RabbitSubscribe({
    exchange: 'exchange1',
    routingKey: 'subscribe-route',
    queue: 'subscribe-queue',
  })
  public async pubSubHandler(msg: {}) {
    console.log(`Received message: ${JSON.stringify(msg)}`);
  }
}
```

### Message Handling

NestJS Plus provides sane defaults for message handling with automatic acking of messages that have been successfully processed by either RPC or PubSub handlers. However, there are situtations where an application may want to Negatively Acknowledge (or Nack) a message. To support this, the library exposes the `Nack` object which when returned from a handler allows a developer to control the message handling behavior. Simply return a `Nack` instance to negatively acknowledge the message.

By default, messages that are Nacked will not be requeued. However, if you would like to requeue the message so that another handler has an opportunity to process it use the optional requeue constructor argument set to true.

```typescript
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagingService {
  @RabbitRPC({
    exchange: 'exchange1',
    routingKey: 'rpc-route',
    queue: 'rpc-queue'
  })
  public async rpcHandler(msg: {}) {
    return {
      if (someCondition) {
        return 42;
      } else if (requeueCondition) {
        return new Nack(true);
      } else {
        // Will not be requeued
        return new Nack();
      }
    };
  }
}
```

### Conditional Handler Registration

In some scenarios, it may not be desirable for all running instances of a NestJS application to register RabbitMQ message handlers. For example, if leveraging the same application code base to expose API instances and worker roles separately it may be desirable to have only the worker instances attach handlers to manage queue subscriptions or RPC requests.

The default behavior is that handlers will be attached, but to opt out simply set the `registerHandlers` configuration option to `false` when registering the RabbitMQModule.

## Sending Messages

### Inject the AmqpConnection

All RabbitMQ interactions go through the `AmqpConnection` object. Assuming you installed and configured the `RabbitMQModule`, the object can be obtained through Nest's dependency injection system. Simply require it as a constructor parameter in a Nest Controller or Service.

```typescript
@Controller()
export class AppController {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  ...
}
```

### Publising Messages (Fire and Forget)

If you just want to publish a message onto a RabbitMQ exchange, use the `publsh` method of the `AmqpConnection` which has the following signature:

```typescript
public publish(
  exchange: string,
  routingKey: string,
  message: any,
  options?: amqplib.Options.Publish
)
```

For example:

```typescript
amqpConnection.publish('some-exchange', 'routing-key', { msg: 'hello world' });
```

### Requesting Data from an RPC

If you'd like to request data from another RPC handler that's been set up using this library, you can use the `request<T>` method of the `AmqpConnection`.

For example:

```typescript
const response = await amqpConnection.request<ExpectedReturnType>({
  exchange: 'exchange1',
  routingKey: 'rpc',
  payload: {
    request: 'val',
  },
  timeout = 10000, // optional timeout for how long the request
  // should wait before failing if no response is received
});
```

#### Type Inference

The generic parameter used with the `request` method lets you specify the _expected_ return type of the RPC response. This is useful for getting intellisense in your editor but no object validation of the actual received object is done on your behalf. This means that you are required to provide your own object validation logic if you need to make runtime guarantees about message structure

#### Interop with other RPC Servers

The RPC functionality included in `@golevelup/nestjs-rabbitmq` is based on the [Direct Reply-To Queue](https://www.rabbitmq.com/direct-reply-to.html) functionality of RabbitMQ. It is possible that because of this, the client library (`AmqpConnection.request`) could be used to interact with an RPC server implemented using a different language or framework. However, this functionality has not been verified.

## Advanced Patterns

### Competing Consumers

The competing consumer pattern is useful when building decoupled applications especially when it comes to things like RPC or [Work Queues](https://www.rabbitmq.com/tutorials/tutorial-two-javascript.html). In these scenarios, it often desirable to ensure that only one handler processes a given message especially if your app is horizontally scaled.

In the previous examples, both RPC and Pub/Sub would be using the Competing Consumer pattern by default through the use of a named `queue` parameter. If running multiple instances of the application, each instance would bind to the same named queue and receive the messages in a round robin fashion.

If you don't want this behavior, simply don't provide a queue name. A unique one will be generated automatically and all instances of the handler will receive their own copy of the message.

**Important** RPC behavior has not been tested without the use of a named queue as this would cause multiple messages to potentially be sent back in response to a single request. If you're using RPC it is highly recommended that you specify a named queue. The API may be updated in the future to specifically require this.

```typescript
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagingService {
  @RabbitSubscribe({
    exchange: 'exchange1',
    routingKey: 'subscribe-route1',
    queue: 'subscribe-queue',
  })
  public async competingPubSubHandler(msg: {}) {
    console.log(`Received message: ${JSON.stringify(msg)}`);
  }

  @RabbitSubscribe({
    exchange: 'exchange1',
    routingKey: 'subscribe-route2',
  })
  public async messagePerInstanceHandler(msg: {}) {
    console.log(`Received message: ${JSON.stringify(msg)}`);
  }
}
```

## Contribute

Contributions welcome! Read the [contribution guidelines](../../CONTRIBUTING.md) first.

## License

[MIT License](../../LICENSE)
