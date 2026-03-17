# RabbitMQ

This module features an opinionated set of decorators for common RabbitMQ patterns including Publish/Subscribe and RPC using Rabbit's [Direct Reply-To Queue](https://www.rabbitmq.com/direct-reply-to.html) for optimal performance.

It allows you to expose normal NestJS service methods as messaging handlers that can be configured to support a variety of messaging patterns.

<div style="display: flex; gap: 10px;">
<a href="https://www.npmjs.com/package/@golevelup/nestjs-rabbitmq">
<img alt="downloads" src="https://img.shields.io/npm/dt/@golevelup/nestjs-rabbitmq.svg?style=flat"></a>
<img alt="license" src="https://img.shields.io/npm/l/@golevelup/nestjs-rabbitmq.svg">
</div>

## Getting Started

::: code-group

```bash [npm]
npm install ---save @golevelup/nestjs-rabbitmq
```

```bash [yarn]
yarn add @golevelup/nestjs-rabbitmq
```

```bash [pnpm]
pnpm add @golevelup/nestjs-rabbitmq
```

:::

## Motivation

NestJS offers an out of the box microservices experience with support for a variety of transports. However, because NestJS microservices strives to work with a variety of transport mechanisms in a generic way, it misses out on some of the powerful functionality offered by individual transport layers.

## Connection Management

In previous versions, this package did not support advanced connection management and if you tried to launch the app when a connection could not be established, an error was thrown and caused the app to crash.

Now, this package leverages [`amqp-connection-manager`](https://github.com/benbria/node-amqp-connection-manager) package to support connection resiliency.

**NOTE**: to maintain the same previous behavior and not introduce a major version update, the previous behavior is still the default.

If you want to transition to the new behavior and enable connection resiliency, you can configure `connectionInitOptions` to not wait for a connection to be available, for example:

```typescript
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    RabbitMQModule.forRoot({
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
    RabbitMQModule.forRoot({
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
import { RABBIT_CONTEXT_TYPE_KEY } from '@golevelup/nestjs-rabbitmq';
@Injectable()
class ExampleInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const contextType = context.getType<
      'http' | typeof RABBIT_CONTEXT_TYPE_KEY
    >();

    // Do nothing if this is a RabbitMQ event
    if (contextType === RABBIT_CONTEXT_TYPE_KEY) {
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
    RabbitMQModule.forRoot({
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
Then simply add the corresponding decorator to the whole controller or the method.

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

### Binding a Queue to Multiple Exchanges

You can bind a single queue to routing keys from multiple different exchanges using the `bindings` option in `@RabbitSubscribe`. This is useful when you want a handler to receive messages that may arrive from different exchanges.

Each entry in `bindings` specifies an `exchange` and a `routingKey`. All specified bindings are applied to the queue in addition to any top-level `exchange` and `routingKey` options.

```typescript
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagingService {
  @RabbitSubscribe({
    queue: 'my-queue',
    bindings: [
      { exchange: 'exchange1', routingKey: 'route.a' },
      { exchange: 'exchange2', routingKey: 'route.b' },
    ],
  })
  public async multiExchangeHandler(msg: {}) {
    console.log(`Received message: ${JSON.stringify(msg)}`);
  }
}
```

You can also mix `bindings` with a top-level `exchange` and `routingKey` to combine both approaches:

```typescript
@RabbitSubscribe({
  exchange: 'exchange1',
  routingKey: 'route.c',
  queue: 'my-queue',
  bindings: [
    { exchange: 'exchange2', routingKey: 'route.d' },
  ],
})
public async mixedHandler(msg: {}) {
  console.log(`Received message: ${JSON.stringify(msg)}`);
}
```

### Handling messages with format different than JSON

By default, messages are parsed with `JSON.parse` method when they are received and stringified with `JSON.stringify` on publish.
If you wish to change this behavior, you can use your own parsers, like so

```typescript
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { MessagingController } from './messaging/messaging.controller';
import { MessagingService } from './messaging/messaging.service';
import { ConsumeMessage } from 'amqplib';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      // ...
      deserializer: (message: Buffer, msg: ConsumeMessage) => {
        const decodedMessage = myCustomDeserializer(
          msg.toString(),
          msg.properties.headers,
        );
        return decodedMessage;
      },
      serializer: (msg: any) => {
        const encodedMessage = myCustomSerializer(msg);
        return Buffer.from(encodedMessage);
      },
    }),
  ],
  // ...
})
export class RabbitExampleModule {}
```

Also, if you simply do not want to parse incoming message, set flag `allowNonJsonMessages` on consumer level, it will return raw message if unable to parse it

### Message Handling

NestJS Plus provides sane defaults for message handling with automatic acking of messages that have been successfully processed by either RPC or PubSub handlers. However, there are situations where an application may want to Negatively Acknowledge (or Nack) a message. To support this, the library exposes the `Nack` object which when returned from a handler allows a developer to control the message handling behavior. Simply return a `Nack` instance to negatively acknowledge the message.

By default, `new Nack()` will nack the message **without** requeuing it (equivalent to `new Nack(false)`). If you would like to requeue the message so that another handler has an opportunity to process it, pass `true` to the constructor.

> **⚠️ Warning:** Returning `new Nack(true)` requeues the message immediately. If your handler always fails (e.g. due to a persistent error), this creates an **infinite processing loop**. Use `Nack(true)` only when you have a mechanism to prevent unbounded retries, for example by inspecting a retry counter in the message headers.

```typescript
import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagingService {
  @RabbitSubscribe({
    exchange: 'exchange1',
    routingKey: 'subscribe-route',
    queue: 'subscribe-queue',
  })
  public async pubSubHandler(msg: {}) {
    try {
      // ... process message ...
      // returning void/undefined here causes the library to auto-ack the message
    } catch (e) {
      // Log the error so it's not silently swallowed
      console.error('Failed to process message', e);
      // Nack without requeue — message goes to the dead-letter exchange (if configured)
      return new Nack(false);
    }
  }
}
```

If you need to conditionally requeue vs. dead-letter a message, you can use a retry counter stored in the message headers. Note that you are responsible for incrementing this counter when republishing — this example only shows the consumer side:

```typescript
import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
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
    // x-retry-count must be set by your retry infrastructure when republishing
    const retryCount = (amqpMsg.properties.headers?.['x-retry-count'] ?? 0) as number;

    try {
      // ... process message ...
    } catch (e) {
      console.error('Failed to process message', e);
      if (retryCount < 3) {
        // Requeue for retry — make sure you have a retry counter to avoid infinite loops
        return new Nack(true);
      }
      // Exhausted retries — nack without requeue (routes to DLQ if configured)
      return new Nack(false);
    }
  }
}
```

**Quick reference:**

| Scenario | What to return |
|---|---|
| Processing succeeded | `void` / `undefined` — library auto-acks |
| Non-recoverable error, send to DLQ | `return new Nack()` or `return new Nack(false)` |
| Retriable error, put back in queue | `return new Nack(true)` _(use with care — can cause infinite loops)_ |
| Error thrown from handler (uncaught) | Library nacks without requeue by default via `errorHandler` |

> **Note:** The `channel` object is **not** injected directly into the handler. The second argument to a subscriber handler is always `amqplib.ConsumeMessage` (the raw AMQP message). Use the `Nack` return value or a custom `errorHandler` to control acknowledgement rather than calling `channel.nack()` manually.

### Conditional Handler Registration

In some scenarios, it may not be desirable for all running instances of a NestJS application to register RabbitMQ message handlers. For example, if leveraging the same application code base to expose API instances and worker roles separately it may be desirable to have only the worker instances attach handlers to manage queue subscriptions or RPC requests.

The default behavior is that handlers will be attached, but to opt out simply set the `registerHandlers` configuration option to `false` when registering the RabbitMQModule.

### Dealing with the amqp original message

In some scenarios, it will be useful to get the original amqp message (to retrieve the fields, properties...).

The raw message is passed to the consumer as a second argument.

If the method signature of the consumer accepts `amqplib.ConsumeMessage` as a second argument, it enables to access all information that is available on the original message.

> **Note:** The second argument is always `ConsumeMessage` (the raw AMQP message object). It is **not** a `Channel`. Do not attempt to call `channel.ack()` or `channel.nack()` directly from the handler — use the `Nack` return value instead (see [Message Handling](#message-handling)).

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

### Configuring Consumer Tag

A consumer tag is a string that uniquely identifies a consumer on a channel. By default, RabbitMQ assigns a server-generated tag. You can customise this for easier consumer management, tracing, and identification.

#### Global Consumer Tag (per queue in module config)

You can set a default `consumerTag` for a queue in the module-level `queues` configuration. All handlers subscribed to that queue will use this tag unless overridden at the handler level.

```typescript
RabbitMQModule.forRoot({
  uri: 'amqp://localhost:5672',
  queues: [
    {
      name: 'my-queue',
      consumerTag: 'my-global-consumer-tag',
    },
  ],
});
```

#### Per-Handler Consumer Tag (via decorator)

You can also set the `consumerTag` directly on an individual handler using `queueOptions.consumerOptions`. A tag set on the decorator takes precedence over the global queue config.

```typescript
import { RabbitSubscribe, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagingService {
  @RabbitSubscribe({
    exchange: 'exchange1',
    routingKey: 'subscribe-route',
    queue: 'my-queue',
    queueOptions: {
      consumerOptions: {
        consumerTag: 'my-handler-consumer-tag',
      },
    },
  })
  public async pubSubHandler(msg: {}) {
    console.log(`Received message: ${JSON.stringify(msg)}`);
  }
}
```

> **Note:** Consumer tags must be unique per channel. If multiple consumers on the same channel share a tag, RabbitMQ will reject the duplicate registration. Ensure tags are unique when configuring them manually.

### Consumer-side Message Batching

Messages can be presented as a batch to the handler. This works by accumulating messages on the consumer-side until either a batch size limit is reached or the batch timer expires. After handling, all messages in the batch will be acked (or nacked) automatically.

:::note
For batching to work correctly, the channel's `prefetchCount` must be set to a value greater than or equal to the configured batch `size`. If the prefetch count is lower than the batch size, RabbitMQ will not deliver enough messages at once to fill a batch. You can configure this either globally via `RabbitMQConfig.prefetchCount` or per-channel via `RabbitMQChannelConfig.prefetchCount`. See the [Configuration section](#configuration) for details.
:::

This behaviour is configured in the `batchOptions` property:

```typescript
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

const batchErrorHandler = (channel, messages, error) => {
  console.log(`Received message batch of length: ${messages.length}`);
};

@Injectable()
export class MessagingService {
  @RabbitSubscribe({
    exchange: 'exchange1',
    routingKey: 'batch-route',
    queue: 'batch-queue',
    batchOptions: {
      size: 10,
      timeout: 200,
      errorHandler: batchErrorHandler,
    },
  })
  public async batchHandler(messages) {
    console.log(`Received message batch of length: ${messages.length}`);
  }
}
```

An error handler may be provided here if your error handling logic needs to be aware of the batch, otherwise it will fall back to either the top-level `errorHandler` or the default error handling behaviour.

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

### Publishing Messages (Fire and Forget)

If you just want to publish a message onto a RabbitMQ exchange, use the `publish` method of the `AmqpConnection` which has the following signature:

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

To mark published messages as persistent on the broker, pass `{ persistent: true }` as the options argument:

```typescript
amqpConnection.publish(
  'some-exchange',
  'routing-key',
  { msg: 'hello world' },
  { persistent: true },
);
```

Note: For messages to be retained across a RabbitMQ broker restart, they must be published to queues (and exchanges) that are declared as `durable`, and the broker must have successfully flushed them to disk in addition to the messages being marked as persistent.

Alternatively, configure `defaultPublishOptions` in the module configuration to apply the message persistence flag to **all** published messages by default:

```typescript
RabbitMQModule.forRoot(RabbitMQModule, {
  exchanges: [{ name: 'some-exchange', type: 'topic' }],
  uri: 'amqp://rabbitmq:rabbitmq@localhost:5672',
  defaultPublishOptions: {
    persistent: true,
  },
});
```

Per-call options passed to `publish()` are merged on top of `defaultPublishOptions`, so individual calls can still override specific properties.

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

#### In distributed systems

In a distributed system, transactions must be correlated by an `X-Correlation-ID`. You can use the `X-Request-ID` in the header to separate sub-requests that are contained in the main request chain.

```typescript
// To create a transaction in the distributed system,
// multiple request correlated by an correlationId
const correlationId = randomUUID();
const response = await amqpConnection.request<ExpectedReturnType>({
  exchange: 'exchange1',
  routingKey: 'rpc',
  correlationId,
  // Each request in the transaction has its own requestId
  headers: { 'X-Request-ID': randomUUID() },
  payload: {
    request: 'val',
  },
});
```

#### Handling RPC Errors

The library provides custom error classes that you can catch and handle specifically.

##### RpcTimeoutError

When an RPC request times out, an `RpcTimeoutError` is thrown. This error includes detailed information about the timeout:

```typescript
import { AmqpConnection, RpcTimeoutError } from '@golevelup/nestjs-rabbitmq';

try {
  const response = await amqpConnection.request<ExpectedReturnType>({
    exchange: 'exchange1',
    routingKey: 'rpc',
    payload: { request: 'val' },
    timeout: 5000,
  });
} catch (error) {
  if (error instanceof RpcTimeoutError) {
    console.error(`RPC timed out after ${error.timeout}ms`);
    console.error(
      `Exchange: ${error.exchange}, Routing Key: ${error.routingKey}`,
    );
    // Handle timeout specifically
  } else {
    // Handle other errors
    throw error;
  }
}
```

##### Other Custom Errors

Following custom error classes are available for more granular error handling:

- `NullMessageError` - Thrown when a null message is received
- `ChannelNotAvailableError` - Thrown when attempting to use a channel that is not available
- `ConnectionNotAvailableError` - Thrown when attempting to use a connection that is not available

These can all be imported from `@golevelup/nestjs-rabbitmq` and used for specific error handling in your application.

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

This is done with the `errorHandler` property that is available both in RPC and RabbitSubscribe.

```typescript
  @RabbitSubscribe({
    exchange: 'exchange1',
    routingKey: 'subscribe-route1',
    queue: 'subscribe-queue',
    errorHandler: myErrorHandler
  })
```

> it should be used with `rpcOptions` for RPC

The library exposes two complementary mechanisms for error handling:

- **`errorBehavior`** (per-handler) / **`defaultSubscribeErrorBehavior`** (global): An enum that controls what happens to the message when an error is thrown and no custom `errorHandler` is provided. The default is `MessageHandlerErrorBehavior.REQUEUE` — the message is nacked **and requeued**. Other options are `MessageHandlerErrorBehavior.NACK` (nack without requeue) and `MessageHandlerErrorBehavior.ACK`.
- **`errorHandler`** (per-handler): A custom function that gives you full control over error handling (e.g. inspecting message properties to decide whether to requeue). When provided, it takes precedence over the `errorBehavior` enum.

> ⚠️ The default `MessageHandlerErrorBehavior.REQUEUE` can cause **infinite processing loops** if the error is persistent. Consider setting `defaultSubscribeErrorBehavior: MessageHandlerErrorBehavior.NACK` globally, or configure a dead-letter exchange to route failed messages elsewhere.

Please note that nack will trigger the dead-letter mechanism of RabbitMQ (and so, you can use the deadLetterExchange in the queueOptions in order to send the message somewhere else).

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

## Testing

### Prevent Connection Error

Normally, you would not want to setup a RabbitMq broker locally or even connect to a external one during tests. So, first we have to prevent the connection to be attempted. This can be easily achieved by passing an `undefined` config to `RabbitMQModule.forRoot`:

```typescript
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    RabbitMQModule.forRoot(
      RabbitMQModule,
      /** Not sending config object makes the connection process to be ignored */
      process.env.NODE_ENV !== 'test'
        ? {
            exchanges: [
              {
                name: 'exchange1',
                type: 'topic',
              },
            ],
            uri: 'amqp://rabbitmq:rabbitmq@localhost:5672',
            connectionInitOptions: { wait: false },
          }
        : undefined,
    ),
  ],
})
export class RabbitExampleModule {}
```

In this example, when running on a `test` environment, config will be `undefined` thus connection will no happen.

### Mock Connection

You saw above how to prevent the connection during test, but now we'll have also to mock the `RabbitExampleModule` so it exports `AmqpConnection` to our publishers (we do not worry about the subscribers because they will be ignored along with the connection).

```typescript
// In your test setup...

import { Module } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { AppModule } from 'where your root module is located';
import { RabbitExampleModule } from 'where your rabbitmq module is located';

// Create a valid mock module
@Module({
  providers: [
    {
      provide: AmqpConnection,
      useValue: createMock<AmqpConnection>(),
    },
  ],
  exports: [AmqpConnection],
})
class MockRabbitExampleModule {}

// Then override the real `RabbitMqModule` with the mocked one
beforeAll(async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideModule(RabbitExampleModule)
    .useModule(MockRabbitExampleModule)
    .compile();

  const app = moduleFixture.createNestApplication();

  await app.init();
});
```

And now your publishers that inject `AmqpConnection` will find it very well mocked.
