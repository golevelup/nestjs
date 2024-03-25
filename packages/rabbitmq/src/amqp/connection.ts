import { Logger, LoggerService } from '@nestjs/common';
import {
  ChannelWrapper,
  AmqpConnectionManager,
  connect,
} from 'amqp-connection-manager';
import {
  ConsumeMessage,
  Channel,
  Connection,
  ConfirmChannel,
  Options,
} from 'amqplib';
import {
  EMPTY,
  interval,
  lastValueFrom,
  race,
  Subject,
  throwError,
} from 'rxjs';
import { catchError, filter, first, map, take, timeout } from 'rxjs/operators';
import { randomUUID } from 'crypto';
import { defaultAssertQueueErrorHandler, RabbitMQQueueConfig } from '..';
import {
  ConnectionInitOptions,
  MessageHandlerOptions,
  RabbitMQConfig,
  RequestOptions,
  RabbitMQChannelConfig,
  ConsumeOptions,
} from '../rabbitmq.interfaces';
import {
  getHandlerForLegacyBehavior,
  MessageHandlerErrorBehavior,
} from './errorBehaviors';
import { Nack, RpcResponse, SubscribeResponse } from './handlerResponses';
import { isNull } from 'lodash';
import { matchesRoutingKey } from './utils';

const DIRECT_REPLY_QUEUE = 'amq.rabbitmq.reply-to';

export type ConsumerTag = string;

export type SubscriberHandler<T = unknown> = (
  msg: T | undefined,
  rawMessage?: ConsumeMessage,
  headers?: any
) => Promise<SubscribeResponse>;

export interface CorrelationMessage {
  correlationId: string;
  requestId?: string;
  message: Record<string, unknown>;
}

export interface SubscriptionResult {
  consumerTag: ConsumerTag;
}

export type BaseConsumerHandler = {
  consumerTag: string;
  channel: ConfirmChannel;
};

export type ConsumerHandler<T, U> =
  | (BaseConsumerHandler & {
      type: 'subscribe';
      msgOptions: MessageHandlerOptions;
      handler: (
        msg: T | undefined,
        rawMessage?: ConsumeMessage,
        headers?: any
      ) => Promise<SubscribeResponse>;
    })
  | (BaseConsumerHandler & {
      type: 'rpc';
      rpcOptions: MessageHandlerOptions;
      handler: (
        msg: T | undefined,
        rawMessage?: ConsumeMessage,
        headers?: any
      ) => Promise<RpcResponse<U>>;
    });

type Consumer = (msg: ConsumeMessage | null) => void | Promise<void>;

const defaultConfig = {
  name: 'default',
  prefetchCount: 10,
  defaultExchangeType: 'topic',
  defaultRpcErrorHandler: getHandlerForLegacyBehavior(
    MessageHandlerErrorBehavior.REQUEUE
  ),
  defaultSubscribeErrorBehavior: MessageHandlerErrorBehavior.REQUEUE,
  exchanges: [],
  exchangeBindings: [],
  queues: [],
  defaultRpcTimeout: 10000,
  connectionInitOptions: {
    wait: true,
    timeout: 5000,
    reject: true,
  },
  connectionManagerOptions: {},
  registerHandlers: true,
  enableDirectReplyTo: true,
  channels: {},
  handlers: {},
  enableControllerDiscovery: false,
};

export class AmqpConnection {
  private readonly messageSubject = new Subject<CorrelationMessage>();
  private readonly logger: LoggerService;
  private readonly initialized = new Subject<void>();
  private _managedConnection!: AmqpConnectionManager;
  /**
   * Will now specify the default managed channel.
   */
  private _managedChannel!: ChannelWrapper;
  private _managedChannels: Record<string, ChannelWrapper> = {};
  /**
   * Will now specify the default channel.
   */
  private _channel!: ConfirmChannel;
  private _channels: Record<string, ConfirmChannel> = {};
  private _connection?: Connection;

  private _consumers: Record<ConsumerTag, ConsumerHandler<unknown, unknown>> =
    {};

  private readonly config: Required<RabbitMQConfig>;

  private readonly outstandingMessageProcessing = new Set<Promise<void>>();

  constructor(config: RabbitMQConfig) {
    this.config = {
      deserializer: (message) => JSON.parse(message.toString()),
      serializer: (value) => Buffer.from(JSON.stringify(value)),
      logger: config.logger || new Logger(AmqpConnection.name),
      ...defaultConfig,
      ...config,
    };

    this.logger = this.config.logger;
  }

  get channel(): Channel {
    if (!this._channel) throw new Error('channel is not available');
    return this._channel;
  }

  get connection(): Connection {
    if (!this._connection) throw new Error('connection is not available');
    return this._connection;
  }

  get managedChannel(): ChannelWrapper {
    return this._managedChannel;
  }

  get managedConnection(): AmqpConnectionManager {
    return this._managedConnection;
  }

  get configuration() {
    return this.config;
  }

  get channels() {
    return this._channels;
  }

  get managedChannels() {
    return this._managedChannels;
  }

  get connected() {
    return this._managedConnection.isConnected();
  }

  public async init(): Promise<void> {
    const options: Required<ConnectionInitOptions> = {
      ...defaultConfig.connectionInitOptions,
      ...this.config.connectionInitOptions,
    };

    const { wait, timeout: timeoutInterval, reject } = options;

    const p = this.initCore();
    if (!wait) return p;

    return lastValueFrom(
      this.initialized.pipe(
        take(1),
        timeout({
          each: timeoutInterval,
          with: () =>
            throwError(
              () =>
                new Error(
                  `Failed to connect to a RabbitMQ broker within a timeout of ${timeoutInterval}ms`
                )
            ),
        }),
        catchError((err) => (reject ? throwError(() => err) : EMPTY))
      )
    );
  }

  private async initCore(): Promise<void> {
    this.logger.log(
      `Trying to connect to RabbitMQ broker (${this.config.name})`
    );

    this._managedConnection = connect(
      Array.isArray(this.config.uri) ? this.config.uri : [this.config.uri],
      this.config.connectionManagerOptions
    );

    this._managedConnection.on('connect', ({ connection }) => {
      this._connection = connection;
      this.logger.log(
        `Successfully connected to RabbitMQ broker (${this.config.name})`
      );
    });

    this._managedConnection.on('disconnect', ({ err }) => {
      this.logger.error(
        `Disconnected from RabbitMQ broker (${this.config.name})`,
        err?.stack
      );
    });

    this._managedConnection.on('connectFailed', ({ err }) => {
      this.logger.error(
        `Failed to connect to RabbitMQ broker (${this.config.name})`,
        err?.stack
      );
    });

    const defaultChannel: { name: string; config: RabbitMQChannelConfig } = {
      name: AmqpConnection.name,
      config: {
        prefetchCount: this.config.prefetchCount,
        default: true,
      },
    };

    await Promise.all([
      Promise.all(
        Object.keys(this.config.channels).map(async (channelName) => {
          const config = this.config.channels[channelName];
          // Only takes the first channel specified as default so other ones get created.
          if (defaultChannel.name === AmqpConnection.name && config.default) {
            defaultChannel.name = channelName;
            defaultChannel.config.prefetchCount =
              config.prefetchCount || this.config.prefetchCount;
            return;
          }

          return this.setupManagedChannel(channelName, {
            ...config,
            default: false,
          });
        })
      ),
      this.setupManagedChannel(defaultChannel.name, defaultChannel.config),
    ]);
  }

  private async setupInitChannel(
    channel: ConfirmChannel,
    name: string,
    config: RabbitMQChannelConfig
  ): Promise<void> {
    this._channels[name] = channel;

    await channel.prefetch(config.prefetchCount || this.config.prefetchCount);

    if (config.default) {
      this._channel = channel;

      // Always assert exchanges & rpc queue in default channel.
      await Promise.all(
        this.config.exchanges.map((x) => {
          const { createExchangeIfNotExists = true } = x;

          if (createExchangeIfNotExists) {
            return channel.assertExchange(
              x.name,
              x.type || this.config.defaultExchangeType,
              x.options
            );
          }
          return channel.checkExchange(x.name);
        })
      );

      await Promise.all(
        this.config.exchangeBindings.map((exchangeBinding) =>
          channel.bindExchange(
            exchangeBinding.destination,
            exchangeBinding.source,
            exchangeBinding.pattern,
            exchangeBinding.args
          )
        )
      );

      await this.setupQueuesWithBindings(channel, this.config.queues);

      if (this.config.enableDirectReplyTo) {
        await this.initDirectReplyQueue(channel);
      }

      this.initialized.next();
    }
  }

  private async setupQueuesWithBindings(
    channel: ConfirmChannel,
    queues: RabbitMQQueueConfig[]
  ) {
    await Promise.all(
      queues.map(async (configuredQueue) => {
        const { name, options, bindQueueArguments, ...rest } = configuredQueue;
        const queueOptions = {
          ...options,
          ...(bindQueueArguments !== undefined && { bindQueueArguments }),
        };

        await this.setupQueue(
          {
            ...rest,
            ...(name !== undefined && { queue: name }),
            queueOptions,
          },
          channel
        );
      })
    );
  }

  private async initDirectReplyQueue(channel: ConfirmChannel) {
    // Set up a consumer on the Direct Reply-To queue to facilitate RPC functionality
    await channel.consume(
      DIRECT_REPLY_QUEUE,
      (msg) => {
        if (msg == null) {
          return;
        }

        // Check that the Buffer has content, before trying to parse it
        const message =
          msg.content.length > 0
            ? this.config.deserializer(msg.content, msg)
            : undefined;

        const correlationMessage: CorrelationMessage = {
          correlationId: msg.properties.correlationId.toString(),
          requestId: msg.properties?.headers?.['X-Request-ID']?.toString(),
          message: message,
        };

        this.messageSubject.next(correlationMessage);
      },
      {
        noAck: true,
      }
    );
  }

  public async request<T>(requestOptions: RequestOptions): Promise<T> {
    const correlationId = requestOptions.correlationId || randomUUID();
    const requestId = requestOptions?.headers?.['X-Request-ID'];
    const timeout = requestOptions.timeout || this.config.defaultRpcTimeout;
    const payload = requestOptions.payload || {};

    const response$ = this.messageSubject.pipe(
      filter((x) =>
        requestId
          ? x.correlationId === correlationId && x.requestId === requestId
          : x.correlationId === correlationId
      ),
      map((x) => x.message as T),
      first()
    );

    const timeout$ = interval(timeout).pipe(
      first(),
      map(() => {
        throw new Error(
          `Failed to receive response within timeout of ${timeout}ms for exchange "${requestOptions.exchange}" and routing key "${requestOptions.routingKey}"`
        );
      })
    );

    const result = lastValueFrom(race(response$, timeout$));

    await this.publish(
      requestOptions.exchange,
      requestOptions.routingKey,
      payload,
      {
        replyTo: DIRECT_REPLY_QUEUE,
        correlationId,
        headers: requestOptions.headers,
        expiration: requestOptions.expiration,
      }
    );

    return result;
  }

  public async createSubscriber<T>(
    handler: SubscriberHandler<T>,
    msgOptions: MessageHandlerOptions,
    originalHandlerName: string,
    consumeOptions?: ConsumeOptions
  ): Promise<SubscriptionResult> {
    return new Promise((res) => {
      let result: SubscriptionResult;
      this.selectManagedChannel(msgOptions?.queueOptions?.channel)
        .addSetup(async (channel) => {
          const consumerTag = await this.setupSubscriberChannel<T>(
            handler,
            msgOptions,
            channel,
            originalHandlerName,
            consumeOptions
          );
          result = { consumerTag };
        })
        .then(() => {
          res(result);
        });
    });
  }

  /**
   * Wrap a consumer with logic that tracks the outstanding message processing to
   * be able to wait for them on shutdown.
   */
  private wrapConsumer(consumer: Consumer): Consumer {
    return (msg: ConsumeMessage | null) => {
      const messageProcessingPromise = Promise.resolve(consumer(msg));
      this.outstandingMessageProcessing.add(messageProcessingPromise);
      messageProcessingPromise.finally(() =>
        this.outstandingMessageProcessing.delete(messageProcessingPromise)
      );
    };
  }

  private async setupSubscriberChannel<T>(
    handler: SubscriberHandler<T>,
    msgOptions: MessageHandlerOptions,
    channel: ConfirmChannel,
    originalHandlerName = 'unknown',
    consumeOptions?: ConsumeOptions
  ): Promise<ConsumerTag> {
    const queue = await this.setupQueue(msgOptions, channel);

    const { consumerTag }: { consumerTag: ConsumerTag } = await channel.consume(
      queue,
      this.wrapConsumer(async (msg) => {
        try {
          if (isNull(msg)) {
            throw new Error('Received null message');
          }

          const response = await this.handleMessage(
            handler,
            msg,
            msgOptions.allowNonJsonMessages
          );

          if (response instanceof Nack) {
            channel.nack(msg, false, response.requeue);
            return;
          }

          // developers should be responsible to avoid subscribers that return therefore
          // the request will be acknowledged
          if (response) {
            this.logger.warn(
              `Received response: [${this.config.serializer(
                response
              )}] from subscribe handler [${originalHandlerName}]. Subscribe handlers should only return void`
            );
          }

          channel.ack(msg);
        } catch (e) {
          if (isNull(msg)) {
            return;
          } else {
            const errorHandler =
              msgOptions.errorHandler ||
              getHandlerForLegacyBehavior(
                msgOptions.errorBehavior ||
                  this.config.defaultSubscribeErrorBehavior
              );

            await errorHandler(channel, msg, e);
          }
        }
      }),
      consumeOptions
    );

    this.registerConsumerForQueue({
      type: 'subscribe',
      consumerTag,
      handler,
      msgOptions,
      channel,
    });

    return consumerTag;
  }

  public async createRpc<T, U>(
    handler: (
      msg: T | undefined,
      rawMessage?: ConsumeMessage,
      headers?: any
    ) => Promise<RpcResponse<U>>,
    rpcOptions: MessageHandlerOptions
  ): Promise<SubscriptionResult> {
    return new Promise((res) => {
      let result: SubscriptionResult;
      this.selectManagedChannel(rpcOptions?.queueOptions?.channel)
        .addSetup(async (channel) => {
          const consumerTag = await this.setupRpcChannel<T, U>(
            handler,
            rpcOptions,
            channel
          );
          result = { consumerTag };
          res({ consumerTag });
        })
        .then(() => {
          res(result);
        });
    });
  }

  public async setupRpcChannel<T, U>(
    handler: (
      msg: T | undefined,
      rawMessage?: ConsumeMessage,
      headers?: any
    ) => Promise<RpcResponse<U>>,
    rpcOptions: MessageHandlerOptions,
    channel: ConfirmChannel
  ): Promise<ConsumerTag> {
    const queue = await this.setupQueue(rpcOptions, channel);

    const { consumerTag }: { consumerTag: ConsumerTag } = await channel.consume(
      queue,
      this.wrapConsumer(async (msg) => {
        try {
          if (msg == null) {
            throw new Error('Received null message');
          }

          if (
            !matchesRoutingKey(msg.fields.routingKey, rpcOptions.routingKey)
          ) {
            channel.nack(msg, false, false);
            this.logger.error(
              'Received message with invalid routing key: ' +
                msg.fields.routingKey
            );
            return;
          }

          const response = await this.handleMessage(
            handler,
            msg,
            rpcOptions.allowNonJsonMessages
          );

          if (response instanceof Nack) {
            channel.nack(msg, false, response.requeue);
            return;
          }

          const { replyTo, correlationId, expiration, headers } =
            msg.properties;
          if (replyTo) {
            await this.publish('', replyTo, response, {
              correlationId,
              expiration,
              headers,
              persistent: rpcOptions.usePersistentReplyTo ?? false,
            });
          }
          channel.ack(msg);
        } catch (e) {
          if (msg == null) {
            return;
          } else {
            const errorHandler =
              rpcOptions.errorHandler ||
              this.config.defaultRpcErrorHandler ||
              getHandlerForLegacyBehavior(
                rpcOptions.errorBehavior ||
                  this.config.defaultSubscribeErrorBehavior
              );

            await errorHandler(channel, msg, e);
          }
        }
      }),
      rpcOptions?.queueOptions?.consumerOptions
    );

    this.registerConsumerForQueue({
      type: 'rpc',
      consumerTag,
      handler,
      rpcOptions,
      channel,
    });

    return consumerTag;
  }

  public publish<T = any>(
    exchange: string,
    routingKey: string,
    message: T,
    options?: Options.Publish
  ): Promise<boolean> {
    let buffer: Buffer;
    if (message instanceof Buffer) {
      buffer = message;
    } else if (message instanceof Uint8Array) {
      buffer = Buffer.from(message);
    } else if (message != null) {
      buffer = this.config.serializer(message);
    } else {
      buffer = Buffer.alloc(0);
    }

    return this._managedChannel.publish(exchange, routingKey, buffer, options);
  }

  private handleMessage<T, U>(
    handler: (
      msg: T | undefined,
      rawMessage?: ConsumeMessage,
      headers?: any
    ) => Promise<U>,
    msg: ConsumeMessage,
    allowNonJsonMessages?: boolean
  ) {
    let message: T | undefined = undefined;
    let headers: any = undefined;
    if (msg.content) {
      if (allowNonJsonMessages) {
        try {
          message = this.config.deserializer(msg.content, msg) as T;
        } catch {
          // Pass raw message since flag `allowNonJsonMessages` is set
          // Casting to `any` first as T doesn't have a type
          message = msg.content.toString() as any as T;
        }
      } else {
        message = this.config.deserializer(msg.content, msg) as T;
      }
    }

    if (msg.properties && msg.properties.headers) {
      headers = msg.properties.headers;
    }

    return handler(message, msg, headers);
  }

  private async setupQueue(
    subscriptionOptions: MessageHandlerOptions,
    channel: ConfirmChannel
  ): Promise<string> {
    const {
      exchange,
      routingKey,
      createQueueIfNotExists = true,
      assertQueueErrorHandler = defaultAssertQueueErrorHandler,
      queueOptions,
      queue: queueName = '',
    } = subscriptionOptions;

    let actualQueue: string;

    if (createQueueIfNotExists) {
      try {
        const { queue } = await channel.assertQueue(queueName, queueOptions);
        actualQueue = queue;
      } catch (error) {
        actualQueue = await assertQueueErrorHandler(
          channel,
          queueName,
          queueOptions,
          error
        );
      }
    } else {
      const { queue } = await channel.checkQueue(
        subscriptionOptions.queue || ''
      );
      actualQueue = queue;
    }

    let bindQueueArguments: any;
    if (queueOptions) {
      bindQueueArguments = queueOptions.bindQueueArguments;
    }

    const routingKeys = Array.isArray(routingKey) ? routingKey : [routingKey];

    if (exchange && routingKeys) {
      await Promise.all(
        routingKeys.map((routingKey) => {
          if (routingKey != null) {
            return channel.bindQueue(
              actualQueue as string,
              exchange,
              routingKey,
              bindQueueArguments
            );
          }
        })
      );
    }

    return actualQueue;
  }

  private setupManagedChannel(name: string, config: RabbitMQChannelConfig) {
    const channel = this._managedConnection.createChannel({
      name,
    });

    this._managedChannels[name] = channel;

    if (config.default) {
      this._managedChannel = channel;
    }

    channel.on('connect', () =>
      this.logger.log(`Successfully connected a RabbitMQ channel "${name}"`)
    );

    channel.on('error', (err, { name }) =>
      this.logger.log(
        `Failed to setup a RabbitMQ channel - name: ${name} / error: ${err.message} ${err.stack}`
      )
    );

    channel.on('close', () =>
      this.logger.log(`Successfully closed a RabbitMQ channel "${name}"`)
    );

    return channel.addSetup((c) => this.setupInitChannel(c, name, config));
  }

  /**
   * Selects managed channel based on name, if not found uses default.
   * @param name name of the channel
   * @returns channel wrapper
   */
  private selectManagedChannel(name?: string): ChannelWrapper {
    if (!name) return this._managedChannel;
    const channel = this._managedChannels[name];
    if (!channel) {
      this.logger.warn(
        `Channel "${name}" does not exist, using default channel.`
      );

      return this._managedChannel;
    }
    return channel;
  }

  private registerConsumerForQueue<T, U>(consumer: ConsumerHandler<T, U>) {
    (this._consumers as Record<ConsumerTag, ConsumerHandler<T, U>>)[
      consumer.consumerTag
    ] = consumer;
  }

  private unregisterConsumerForQueue(consumerTag: ConsumerTag) {
    delete this._consumers[consumerTag];
  }

  private getConsumer(consumerTag: ConsumerTag) {
    return this._consumers[consumerTag];
  }

  get consumerTags(): string[] {
    return Object.keys(this._consumers);
  }

  public async cancelConsumer(consumerTag: ConsumerTag) {
    const consumer = this.getConsumer(consumerTag);
    if (consumer && consumer.channel) {
      await consumer.channel.cancel(consumerTag);
    }
  }

  public async resumeConsumer<T, U>(
    consumerTag: ConsumerTag
  ): Promise<ConsumerTag | null> {
    const consumer = this.getConsumer(consumerTag) as ConsumerHandler<T, U>;
    if (!consumer) {
      return null;
    }
    let newConsumerTag: ConsumerTag;
    if (consumer.type === 'rpc') {
      newConsumerTag = await this.setupRpcChannel<T, U>(
        consumer.handler,
        consumer.rpcOptions,
        consumer.channel
      );
    } else {
      newConsumerTag = await this.setupSubscriberChannel<T>(
        consumer.handler,
        consumer.msgOptions,
        consumer.channel
      );
    }
    // A new consumerTag was created, remove old
    this.unregisterConsumerForQueue(consumerTag);
    return newConsumerTag;
  }

  public async close(): Promise<void> {
    const managedChannels = Object.values(this._managedChannels);

    // First cancel all consumers so they stop getting new messages
    await Promise.all(managedChannels.map((channel) => channel.cancelAll()));

    // Wait for all the outstanding messages to be processed
    if (this.outstandingMessageProcessing.size) {
      this.logger.log(
        { outstandingMessageCount: this.outstandingMessageProcessing.size },
        'Waiting for outstanding consumers'
      );
    }
    await Promise.all(this.outstandingMessageProcessing);

    // Close all channels
    await Promise.all(managedChannels.map((channel) => channel.close()));

    await this.managedConnection.close();
  }
}
