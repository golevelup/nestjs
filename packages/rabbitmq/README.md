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
  - [Usage with Interceptors, Guards and Filters](#usage-with-interceptors-guards-and-filters)
  - [Usage with Controllers](#usage-with-controllers)
  - [Receiving Messages](#receiving-messages)
    - [Exposing RPC Handlers](#exposing-rpc-handlers)
    - [Exposing Pub/Sub Handlers](#exposing-pubsub-handlers)
    - [Message Handling](#message-handling)
    - [Conditional Handler Registration](#conditional-handler-registration)
    - [Selecting channel for handler](#selecting-channel-for-handler)
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

**NOTE**: to maintain the same previous behavior and not introduce a major version update, the previous behavior is still the default.

If you want to transition to the new behavior and enable connection resiliency, you can configure `connectionInitOptions` to not wait for a connection to be available, for example:

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

You can also optionally create your own channels which you consume messages from. If you don't create your own channels there will always be one created by default. You can also select which channel is default if you are creating your own. By setting `prefetchCount` for a particular channel you can manage message speeds of your various handlers on the same connection.

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
      channels: {
        'channel-1': {
          prefetchCount: 15,
          default: true,
        },
        'channel-2': {
          prefetchCount: 2,
        },
      },
    }),
    RabbitExampleModule,
  ],
  providers: [MessagingService],
  controllers: [MessagingController],
})
export class RabbitExampleModule {}
```

## Usage with Interceptors, Guards and Filters

This library is built using an underlying NestJS concept called `External Contexts` which allows for methods to be included in the NestJS lifecycle. This means that Guards, Interceptors and Filters (collectively known as "enhancers") can be used in conjunction with RabbitMQ message handlers. However, this can have unwanted/unintended consequences if you are using _Global_ enhancers in your application as these will also apply to all RabbitMQ message handlers. If you were previously expecting all contexts to be HTTP contexts, you may need to add conditional logic to prevent your enhancers from applying to RabbitMQ message handlers.

You can identify RabbitMQ contexts by their context type, `'rmq'`:

```typescript
@Injectable()
class ExampleInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const contextType = context.getType<'http' | 'rmq'>();

    // Do nothing if this is a RabbitMQ event
    if (contextType === 'rmq') {
      return next.handle();
    }

    // Execute custom interceptor logic for HTTP request/response
    return next.handle();
  }
}
```

There is also a utility function available called `isRabbitContext` which provides an alternative way to identify RabbitMQ contexts:

```typescript
import { isRabbitContext } from '@golevelup/nestjs-rabbitmq';

@Injectable()
class ExampleInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    // Do nothing if this is a RabbitMQ event
    if (isRabbitContext(context)) {
      return next.handle();
    }

    // Execute custom interceptor logic for HTTP request/response
    return next.handle();
  }
}
```

## Usage with Controllers

To improve the migration process, it is possible to use NestJS controllers as handlers.
WARNING: When using controllers, be aware that no HTTP context is available.

To enable the controller discovery the option enableControllerDiscovery has to be true.

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
      enableControllerDiscovery: true,
    }),
    RabbitExampleModule,
  ],
  providers: [MessagingService, MessagingController],
  controllers: [MessagingController],
})
export class RabbitExampleModule {}
```

### Interceptors, Guards, Pipes

To use Interceptors, Guards or Pipes, the controller has to be imported as provider in the module.
Then simly add the corresponding decorator to the whole controller or the method.

```typescript
@RabbitRPC({
  routingKey: 'intercepted-rpc-2',
  exchange: 'exchange2',
  queue: 'intercepted-rpc-2',
})
@UseInterceptors(TransformInterceptor)
interceptedRpc() {
  return {
    message: 42,
  };
}
```

```typescript
@RabbitRPC({
  routingKey: 'intercepted-rpc-2',
  exchange: 'exchange2',
  queue: 'intercepted-rpc-2',
  errorBehavior: MessageHandlerErrorBehavior.ACK,
  errorHandler: ReplyErrorCallback,
})
@UsePipes(ValidationPipe)
interceptedRpc(@RabbitPayload()  message:messageDto) {
  return {
    message: 42,
  };
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

### Dealing with the amqp original message

In some scenarios, it wil be useful to get the original amqp message (to retrieve the fields, properties...).

The raw message is passed to the consumer as a second argument.

If the method signature of the consumer accepts `amqplib.ConsumeMessage` as a second argument, it enables to access all information that is available on the original message.

```typescript
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';

@Injectable()
export class MessagingService {
  @RabbitSubscribe({
    exchange: 'exchange1',
    routingKey: 'subscribe-route',
    queue: 'subscribe-queue',
  })
  public async pubSubHandler(msg: {}, amqpMsg: ConsumeMessage) {
    console.log(`Correlation id: ${amqpMsg.properties.correlationId}`);
  }
}
```

### Selecting channel for handler

You can optionally select channel which handler uses to consume messages from.

Set the `queueOptions.channel` to the name of the channel to enable this feature. If channel does not exist or you haven't specified one, it will use the default channel. For channel to exist it needs to be created in module config.

```typescript
import { RabbitSubscribe, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagingService {
  @RabbitRPC({
    exchange: 'exchange1',
    routingKey: 'subscribe-route',
    queue: 'subscribe-queue',
    queueOptions: {
      channel: 'channel-2',
    },
  })
  public async rpcHandler(msg: {}) {
    console.log(`Received rpc message: ${JSON.stringify(msg)}`);

    return { message: 'hi' };
  }

  @RabbitSubscribe({
    exchange: 'exchange1',
    routingKey: 'subscribe-route-2',
    queue: 'subscribe-queue-2',
  })
  public async pubSubHandler(msg: {}) {
    console.log(`Received pub/sub message: ${JSON.stringify(msg)}`);
  }
}
```

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

If you just want to publish a message onto a RabbitMQ exchange, use the `publish` method of the `AmqpConnection` which has the following signature:

```typescript
public publish<T = any>(
  exchange: string,
  routingKey: string,
  message: T,
  options?: amqplib.Options.Publish
)
```

For example:

```typescript
amqpConnection.publish('some-exchange', 'routing-key', { msg: 'hello world' });

// optionally specify a type for generic type checking support
interface CustomModel {
  foo: string;
  bar: string;
}
amqpConnection.publish<CustomModel>('some-exchange', 'routing-key', {});
// this will now show an error that you are missing properties: foo, bar
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
  timeout: 10000, // optional timeout for how long the request
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

### Handling errors

By default, the library tries to do its best to give you the control on errors if you want and to do something sensible by default.

This is done with the `errorHandler` property that is availble both in RPC and RabbitSubscribe.

```typescript
  @RabbitSubscribe({
    exchange: 'exchange1',
    routingKey: 'subscribe-route1',
    queue: 'subscribe-queue',
    errorHandler: myErrorHandler
  })
```

> it should be used with `rpcOptions` for RPC

The default is `defaultNackErrorHandler` and it just nack the message without requeue (which is usually ok to avoid the message coming back in the queue again and again)

However, you can do more fancy stuff like inspecting the message properties to decide to requeue or not. Be aware that you should not requeue indefinitely...

Please note that nack will trigger the dead-letter mecanism of RabbitMQ (and so, you can use the deadLetterExchange in the queueOptions in order to send the message somewhere else).

A complete error handling strategy for RabbitMQ is out of the scope of this library.

### Handling errors during queue creation

Similarly to message errors, the library provide an error handler for failures during a queue creation (more exactly, during the assertQueue operation which will create the queue if it does not exist).

```typescript
  @RabbitSubscribe({
    exchange: 'exchange1',
    routingKey: 'subscribe-route1',
    queue: 'subscribe-queue',
    assertQueueErrorHandler: myErrorHandler
  })
```

The default is `defaultAssertQueueErrorHandler` which just rethrows the RabbitMq error (because there is no "one size fits all" for this situation).

You have the option to use `forceDeleteAssertQueueErrorHandler` which will try to delete the queue and recreate it with the provided queueOptions (if any)

Obviously, you can also provide your own function and do whatever is best for you, in this case the function must return the name of the created queue.

## Contribute

Contributions welcome! Read the [contribution guidelines](../../CONTRIBUTING.md) first.

## License

[MIT License](../../LICENSE)
