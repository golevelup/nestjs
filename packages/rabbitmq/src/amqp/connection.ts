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
  MessageDeserializer,
} from '../rabbitmq.interfaces';
import {
  getHandlerForLegacyBehavior,
  MessageHandlerErrorBehavior,
} from './errorBehaviors';
import {
  ChannelNotAvailableError,
  ConnectionNotAvailableError,
  NullMessageError,
  RpcTimeoutError,
} from './errors';
import { Nack, RpcResponse, SubscribeResponse } from './handlerResponses';
import { isEqual, isNull, merge } from 'lodash';
import { matchesRoutingKey } from './utils';

const DIRECT_REPLY_QUEUE = 'amq.rabbitmq.reply-to';

export type ConsumerTag = string;

export type SubscriberHandler<T = unknown> = (
  msg: T | undefined,
  rawMessage?: ConsumeMessage,
  headers?: any,
) => Promise<SubscribeResponse>;

export type BatchSubscriberHandler<T = unknown> = (
  msg: (T | undefined)[],
  rawMessage?: ConsumeMessage[],
  headers?: any[],
) => Promise<SubscribeResponse>;

export type RpcSubscriberHandler<T = unknown, U = unknown> = (
  msg: T | undefined,
  rawMessage?: ConsumeMessage,
  headers?: any,
) => Promise<RpcResponse<U>>;

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
  msgOptions: MessageHandlerOptions;
};

export type ConsumerHandler<T, U> =
  | (BaseConsumerHandler & {
      type: 'subscribe';
      handler: SubscriberHandler<T>;
    })
  | (BaseConsumerHandler & {
      type: 'subscribe-batch';
      handler: BatchSubscriberHandler<T>;
    })
  | (BaseConsumerHandler & {
      type: 'rpc';
      handler: RpcSubscriberHandler<T, U>;
    });

type Consumer = (msg: ConsumeMessage | null) => void | Promise<void>;

const defaultConfig = {
  name: 'default',
  prefetchCount: 10,
  defaultExchangeType: 'topic',
  defaultRpcErrorHandler: getHandlerForLegacyBehavior(
    MessageHandlerErrorBehavior.REQUEUE,
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
    skipConnectionFailedLogging: false,
    skipDisconnectFailedLogging: false,
  },
  connectionManagerOptions: {},
  registerHandlers: true,
  enableDirectReplyTo: true,
  channels: {},
  handlers: {},
  defaultHandler: '',
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

  private _rpcHandlersByQueue = new Map<
    string,
    Array<{
      routingKey: string | string[];
      handler: RpcSubscriberHandler<any, any>;
      rpcOptions: MessageHandlerOptions;
    }>
  >();

  private _rpcConsumerTagByQueue = new Map<string, ConsumerTag>();

  private readonly config: Required<RabbitMQConfig>;

  private readonly outstandingMessageProcessing = new Set<Promise<void>>();

  constructor(config: RabbitMQConfig) {
    this.config = {
      deserializer: (message) => JSON.parse(message.toString()),
      serializer: (value) => Buffer.from(JSON.stringify(value)),
      logger: config?.logger || new Logger(AmqpConnection.name),
      ...defaultConfig,
      ...config,
    };

    this.logger = this.config.logger;
  }

  get channel(): Channel {
    if (!this._channel) throw new ChannelNotAvailableError();
    return this._channel;
  }

  get connection(): Connection {
    if (!this._connection) throw new ConnectionNotAvailableError();
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

    const {
      skipConnectionFailedLogging,
      skipDisconnectFailedLogging,
      wait,
      timeout: timeoutInterval,
      reject,
    } = options;

    const p = this.initCore(
      wait,
      skipConnectionFailedLogging,
      skipDisconnectFailedLogging,
    );

    if (!wait) {
      this.logger.log(
        `Skipping connection health checks as 'wait' is disabled. The application will proceed without verifying a healthy RabbitMQ connection.`,
      );

      return p;
    }

    return lastValueFrom(
      this.initialized.pipe(
        take(1),
        timeout({
          each: timeoutInterval,
          with: () =>
            throwError(
              () =>
                new Error(
                  `Failed to connect to a RabbitMQ broker within a timeout of ${timeoutInterval}ms`,
                ),
            ),
        }),
        catchError((err) => (reject ? throwError(() => err) : EMPTY)),
      ),
    );
  }

  private async initCore(
    wait = false,
    skipConnectionFailedLogging = false,
    skipDisconnectFailedLogging = false,
  ): Promise<void> {
    this.logger.log(
      `Trying to connect to RabbitMQ broker (${this.config.name})`,
    );

    this._managedConnection = connect(
      Array.isArray(this.config.uri) ? this.config.uri : [this.config.uri],
      this.config.connectionManagerOptions,
    );

    this._managedConnection.on('connect', ({ connection }) => {
      this._connection = connection;
      this.logger.log(
        `Successfully connected to RabbitMQ broker (${this.config.name})`,
      );
    });

    // Logging disconnections should only be able if consumers
    // do not skip it. We may be able to merge with the `skipConnectionFailedLogging`
    // option in the future.
    if (!skipDisconnectFailedLogging) {
      this._managedConnection.on('disconnect', ({ err }) => {
        this.logger.error(
          `Disconnected from RabbitMQ broker (${this.config.name})`,
          err?.stack,
        );
      });
    }

    // Certain consumers might want to skip "connectionFailed" logging
    // therefore this option will allow us to conditionally register this event consumption
    if (!skipConnectionFailedLogging) {
      this._managedConnection.on('connectFailed', ({ err }) => {
        const message = `Connection Failed: Unable to establish a connection to the broker (${this.config.name}). Check the broker's availability, network connectivity, and configuration.`;

        if (!wait) {
          // Lower the log severity if 'wait' is disabled, as the application continues to function.
          this.logger.warn(message);
          if (err?.stack) {
            this.logger.debug?.(`Stack trace: ${err.stack}`);
          }
        } else {
          // Log as an error if 'wait' is enabled, as this impacts the connection health.
          this.logger.error(message, err?.stack);
        }
      });
    }

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
        }),
      ),
      this.setupManagedChannel(defaultChannel.name, defaultChannel.config),
    ]);
  }

  private async setupInitChannel(
    channel: ConfirmChannel,
    name: string,
    config: RabbitMQChannelConfig,
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
              x.options,
            );
          }
          return channel.checkExchange(x.name);
        }),
      );

      await Promise.all(
        this.config.exchangeBindings.map((exchangeBinding) =>
          channel.bindExchange(
            exchangeBinding.destination,
            exchangeBinding.source,
            exchangeBinding.pattern,
            exchangeBinding.args,
          ),
        ),
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
    queues: RabbitMQQueueConfig[],
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
          channel,
        );
      }),
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
      },
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
          : x.correlationId === correlationId,
      ),
      map((x) => x.message as T),
      first(),
    );

    const timeout$ = interval(timeout).pipe(
      first(),
      map(() => {
        throw new RpcTimeoutError(
          timeout,
          requestOptions.exchange,
          requestOptions.routingKey,
        );
      }),
    );

    // Wrapped lastValueFrom(race(response$, timeout$)) in a Promise to properly catch
    // timeout errors. Without this, the timeout could trigger while publish() was
    // still running, causing an unhandled rejection and crashing the application.
    const [result] = await Promise.all([
      lastValueFrom(race(response$, timeout$)),
      this.publish(
        requestOptions.exchange,
        requestOptions.routingKey,
        payload,
        {
          ...requestOptions.publishOptions,
          replyTo: DIRECT_REPLY_QUEUE,
          correlationId,
          headers: requestOptions.headers,
          expiration: requestOptions.expiration,
        },
      ),
    ]);

    return result;
  }

  public async createSubscriber<T>(
    handler: SubscriberHandler<T>,
    msgOptions: MessageHandlerOptions,
    originalHandlerName: string,
    consumeOptions?: ConsumeOptions,
  ): Promise<SubscriptionResult> {
    return this.consumerFactory(msgOptions, (channel, channelMsgOptions) =>
      this.setupSubscriberChannel<T>(
        handler,
        channelMsgOptions,
        channel,
        originalHandlerName,
        consumeOptions,
      ),
    );
  }

  public async createBatchSubscriber<T>(
    handler: BatchSubscriberHandler<T>,
    msgOptions: MessageHandlerOptions,
    consumeOptions?: ConsumeOptions,
  ): Promise<SubscriptionResult> {
    return this.consumerFactory(msgOptions, (channel, channelMsgOptions) =>
      this.setupBatchSubscriberChannel<T>(
        handler,
        channelMsgOptions,
        channel,
        consumeOptions,
      ),
    );
  }

  private async consumerFactory(
    msgOptions: MessageHandlerOptions,
    setupFunction: (
      channel: ConfirmChannel,
      msgOptions: MessageHandlerOptions,
    ) => Promise<string>,
  ): Promise<SubscriptionResult> {
    return new Promise((res) => {
      // Use globally configured consumer tag.
      // See https://github.com/golevelup/nestjs/issues/904

      const queueConfig = this.config.queues.find(
        (q) => q.name === msgOptions.queue,
      );

      const consumerTagConfig: Partial<MessageHandlerOptions> =
        queueConfig?.consumerTag
          ? {
              queueOptions: {
                consumerOptions: {
                  consumerTag: queueConfig.consumerTag,
                },
              },
            }
          : {};

      this.selectManagedChannel(msgOptions?.queueOptions?.channel).addSetup(
        async (channel: ConfirmChannel) => {
          const consumerTag = await setupFunction(
            channel,
            // Override global configuration by merging the global/default
            // tag configuration with the parametized msgOption.
            merge(consumerTagConfig, msgOptions),
          );
          res({ consumerTag });
        },
      );
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
        this.outstandingMessageProcessing.delete(messageProcessingPromise),
      );
    };
  }

  private async setupSubscriberChannel<T>(
    handler: SubscriberHandler<T>,
    msgOptions: MessageHandlerOptions,
    channel: ConfirmChannel,
    originalHandlerName = 'unknown',
    consumeOptions?: ConsumeOptions,
  ): Promise<ConsumerTag> {
    const queue = await this.setupQueue(msgOptions, channel);

    const { consumerTag }: { consumerTag: ConsumerTag } = await channel.consume(
      queue,
      this.wrapConsumer(async (msg) => {
        try {
          if (isNull(msg)) {
            throw new NullMessageError();
          }

          const result = this.deserializeMessage<T>(msg, msgOptions);
          const response = await handler(result.message, msg, result.headers);

          if (response instanceof Nack) {
            channel.nack(msg, false, response.requeue);
            return;
          }

          // developers should be responsible to avoid subscribers that return therefore
          // the request will be acknowledged
          if (response) {
            this.logger.warn(
              `Received response: [${this.config.serializer(
                response,
              )}] from subscribe handler [${originalHandlerName}]. Subscribe handlers should only return void`,
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
                  this.config.defaultSubscribeErrorBehavior,
              );

            await errorHandler(channel, msg, e);
          }
        }
      }),
      consumeOptions,
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

  private async setupBatchSubscriberChannel<T>(
    handler: BatchSubscriberHandler<T>,
    msgOptions: MessageHandlerOptions,
    channel: ConfirmChannel,
    consumeOptions?: ConsumeOptions,
  ): Promise<ConsumerTag> {
    let batchSize = msgOptions.batchOptions?.size;
    let batchTimeout = msgOptions.batchOptions?.timeout;
    let batchMsgs: ConsumeMessage[] = [];
    let batchTimer: NodeJS.Timeout;
    let inflightBatchHandler: () => Promise<void>;

    // Normalize batch values but warn consumer about this adjusts
    if (!batchSize || batchSize < 2) {
      this.logger.warn(
        `batch size too low/not defined, received: ${batchSize}. Adjusting to 10`,
      );
      batchSize = 10;
    }

    if (!batchTimeout || batchTimeout < 1) {
      this.logger.warn(
        `batch timeout too low/not defined, received: ${batchTimeout}. Setting timeout to 200ms`,
      );
      batchTimeout = 200;
    }

    const queue = await this.setupQueue(msgOptions, channel);

    const { consumerTag }: { consumerTag: ConsumerTag } = await channel.consume(
      queue,
      this.wrapConsumer(async (msg) => {
        if (isNull(msg)) {
          return;
        }

        batchMsgs.push(msg);

        if (batchMsgs.length === 1) {
          // Wrapped in a Promise to ensure outstanding message logic is aware.
          await new Promise<void>((resolve) => {
            const batchHandler = async () => {
              const batchMsgsToProcess = batchMsgs;
              batchMsgs = [];

              await this.handleBatchedMessages(
                handler,
                msgOptions,
                channel,
                batchMsgsToProcess,
              );

              resolve();
            };

            batchTimer = setTimeout(batchHandler, batchTimeout);
            inflightBatchHandler = batchHandler;
          });
        } else if (batchMsgs.length === batchSize) {
          clearTimeout(batchTimer);
          await inflightBatchHandler();
        } else {
          batchTimer.refresh();
        }
      }),
      consumeOptions,
    );

    this.registerConsumerForQueue({
      type: 'subscribe-batch',
      consumerTag,
      handler,
      msgOptions,
      channel,
    });

    return consumerTag;
  }

  private async handleBatchedMessages<T>(
    handler: BatchSubscriberHandler<T>,
    msgOptions: MessageHandlerOptions,
    channel: ConfirmChannel,
    batchMsgs: ConsumeMessage[],
  ) {
    try {
      const messages: (T | undefined)[] = [];
      const headers: any[] = [];

      for (const msg of batchMsgs) {
        const result = this.deserializeMessage<T>(msg, msgOptions);
        messages.push(result.message);
        headers.push(result.headers);
      }

      const response = await handler(messages, batchMsgs, headers);

      if (response instanceof Nack) {
        for (const msg of batchMsgs) {
          channel.nack(msg, false, response.requeue);
        }
        return;
      }

      for (const msg of batchMsgs) {
        channel.ack(msg);
      }
    } catch (e) {
      const batchErrorHandler = msgOptions.batchOptions?.errorHandler;
      const errorHandler = msgOptions.errorHandler;
      const defaultErrorHandler = getHandlerForLegacyBehavior(
        msgOptions.errorBehavior || this.config.defaultSubscribeErrorBehavior,
      );

      if (batchErrorHandler) {
        await batchErrorHandler(channel, batchMsgs, e);
      } else if (errorHandler) {
        for (const msg of batchMsgs) {
          await errorHandler(channel, msg, e);
        }
      } else {
        await defaultErrorHandler(channel, batchMsgs, e);
      }
    }
  }

  private findRpcHandler(
    handlers: Array<{
      routingKey: string | string[];
      handler: RpcSubscriberHandler<any, any>;
      rpcOptions: MessageHandlerOptions;
    }>,
    routingKey: string,
  ) {
    for (const entry of handlers) {
      const keys = Array.isArray(entry.routingKey)
        ? entry.routingKey
        : [entry.routingKey];
      if (keys.includes(routingKey)) {
        return entry;
      }
    }
    for (const entry of handlers) {
      if (matchesRoutingKey(routingKey, entry.routingKey)) {
        return entry;
      }
    }
    return null;
  }

  private validateSharedQueueOptions(
    queueName: string,
    newOptions: MessageHandlerOptions,
  ) {
    const existing = this._rpcHandlersByQueue.get(queueName);
    if (!existing || existing.length === 0) return;

    const first = existing[0].rpcOptions;

    if (first.exchange !== newOptions.exchange) {
      throw new Error(
        `RPC handler conflict on queue "${queueName}": ` +
          `exchange "${newOptions.exchange}" does not match ` +
          `already registered exchange "${first.exchange}". ` +
          `All @RabbitRPC handlers sharing a queue must use the same exchange.`,
      );
    }

    const firstChannel = first.queueOptions?.channel;
    const newChannel = newOptions.queueOptions?.channel;
    if (firstChannel !== newChannel) {
      throw new Error(
        `RPC handler conflict on queue "${queueName}": ` +
          `channel "${newChannel}" does not match ` +
          `already registered channel "${firstChannel}". ` +
          `All @RabbitRPC handlers sharing a queue must use the same channel.`,
      );
    }

    if (
      !isEqual(
        first.queueOptions?.consumerOptions ?? {},
        newOptions.queueOptions?.consumerOptions ?? {},
      )
    ) {
      throw new Error(
        `RPC handler conflict on queue "${queueName}": ` +
          `consumerOptions do not match between handlers. ` +
          `All @RabbitRPC handlers sharing a queue must use the same consumerOptions.`,
      );
    }
  }

  public async createRpc<T, U>(
    handler: RpcSubscriberHandler<T, U>,
    rpcOptions: MessageHandlerOptions,
  ): Promise<SubscriptionResult> {
    const queueName = rpcOptions.queue;

    if (!queueName) {
      return this.consumerFactory(rpcOptions, (channel, channelRpcOptions) =>
        this.setupRpcChannel<T, U>(handler, channelRpcOptions, channel),
      );
    }

    this.validateSharedQueueOptions(queueName, rpcOptions);

    if (!this._rpcHandlersByQueue.has(queueName)) {
      this._rpcHandlersByQueue.set(queueName, []);
    }
    this._rpcHandlersByQueue.get(queueName)!.push({
      routingKey: rpcOptions.routingKey!,
      handler,
      rpcOptions,
    });

    if (this._rpcHandlersByQueue.get(queueName)!.length === 1) {
      return this.consumerFactory(rpcOptions, (channel, channelRpcOptions) =>
        this.setupRpcChannel<T, U>(handler, channelRpcOptions, channel),
      );
    }

    const existingTag = this._rpcConsumerTagByQueue.get(queueName);
    if (existingTag) {
      return new Promise((res, rej) => {
        this.selectManagedChannel(rpcOptions?.queueOptions?.channel).addSetup(
          async (channel: ConfirmChannel) => {
            try {
              await this.setupQueue(rpcOptions, channel);
              res({ consumerTag: existingTag });
            } catch (error) {
              rej(error);
              throw error;
            }
          },
        );
      });
    }

    return new Promise((res, rej) => {
      this.selectManagedChannel(rpcOptions?.queueOptions?.channel).addSetup(
        async (channel: ConfirmChannel) => {
          try {
            await this.setupQueue(rpcOptions, channel);
            res({ consumerTag: `shared-rpc-${queueName}` });
          } catch (error) {
            rej(error);
            throw error;
          }
        },
      );
    });
  }

  public async setupRpcChannel<T, U>(
    handler: RpcSubscriberHandler<T, U>,
    rpcOptions: MessageHandlerOptions,
    channel: ConfirmChannel,
  ): Promise<ConsumerTag> {
    const queueName = rpcOptions.queue;
    const handlers = queueName ? this._rpcHandlersByQueue.get(queueName) : null;

    let resolvedQueue: string;
    if (handlers && handlers.length > 0) {
      resolvedQueue = await this.setupQueue(handlers[0].rpcOptions, channel);
      for (let i = 1; i < handlers.length; i++) {
        await this.setupQueue(handlers[i].rpcOptions, channel);
      }
    } else {
      resolvedQueue = await this.setupQueue(rpcOptions, channel);
    }

    const { consumerTag }: { consumerTag: ConsumerTag } = await channel.consume(
      resolvedQueue!,
      this.wrapConsumer(async (msg) => {
        try {
          if (msg == null) {
            throw new NullMessageError();
          }

          let matchedHandler: RpcSubscriberHandler<any, any>;
          let matchedOptions: MessageHandlerOptions;

          if (handlers && handlers.length > 0) {
            const matched = this.findRpcHandler(
              handlers,
              msg.fields.routingKey,
            );
            if (!matched) {
              channel.nack(msg, false, false);
              this.logger.error(
                `No RPC handler found for routing key "${msg.fields.routingKey}" on queue "${queueName}"`,
              );
              return;
            }
            matchedHandler = matched.handler;
            matchedOptions = matched.rpcOptions;
          } else {
            if (
              !matchesRoutingKey(msg.fields.routingKey, rpcOptions.routingKey)
            ) {
              channel.nack(msg, false, false);
              this.logger.error(
                'Received message with invalid routing key: ' +
                  msg.fields.routingKey,
              );
              return;
            }
            matchedHandler = handler;
            matchedOptions = rpcOptions;
          }

          const result = this.deserializeMessage<T>(msg, matchedOptions);
          const response = await matchedHandler(
            result.message,
            msg,
            result.headers,
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
              persistent: matchedOptions.usePersistentReplyTo ?? false,
            });
          }
          channel.ack(msg);
        } catch (e) {
          if (msg == null) {
            return;
          } else {
            const matchedOptions =
              handlers && handlers.length > 0
                ? (this.findRpcHandler(handlers, msg.fields.routingKey)
                    ?.rpcOptions ?? rpcOptions)
                : rpcOptions;

            const errorHandler =
              matchedOptions.errorHandler ||
              this.config.defaultRpcErrorHandler ||
              getHandlerForLegacyBehavior(
                matchedOptions.errorBehavior ||
                  this.config.defaultSubscribeErrorBehavior,
              );

            await errorHandler(channel, msg, e);
          }
        }
      }),
      rpcOptions?.queueOptions?.consumerOptions,
    );

    if (queueName && handlers && handlers.length > 0) {
      this._rpcConsumerTagByQueue.set(queueName, consumerTag);
    }

    this.registerConsumerForQueue({
      type: 'rpc',
      consumerTag,
      handler,
      msgOptions: rpcOptions,
      channel,
    });

    return consumerTag;
  }

  public publish(
    exchange: string,
    routingKey: string,
    message: any,
    options?: Options.Publish,
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

  private deserializeMessage<T>(
    msg: ConsumeMessage,
    options: {
      allowNonJsonMessages?: boolean;
      deserializer?: MessageDeserializer;
    },
  ) {
    let message: T | undefined = undefined;
    let headers: any = undefined;
    const deserializer = options.deserializer || this.config.deserializer;
    if (msg.content) {
      if (options.allowNonJsonMessages) {
        try {
          message = deserializer(msg.content, msg) as T;
        } catch {
          // Pass raw message since flag `allowNonJsonMessages` is set
          // Casting to `any` first as T doesn't have a type
          message = msg.content.toString() as any as T;
        }
      } else {
        message = deserializer(msg.content, msg) as T;
      }
    }

    if (msg.properties && msg.properties.headers) {
      headers = msg.properties.headers;
    }

    return { message, headers };
  }

  private async setupQueue(
    subscriptionOptions: MessageHandlerOptions,
    channel: ConfirmChannel,
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
          error,
        );
      }
    } else {
      const { queue } = await channel.checkQueue(
        subscriptionOptions.queue || '',
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
              bindQueueArguments,
            );
          }
        }),
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
      this.logger.log(`Successfully connected a RabbitMQ channel "${name}"`),
    );

    channel.on('error', (err, { name }) =>
      this.logger.error(
        `Failed to setup a RabbitMQ channel - name: ${name} / error: ${err.message} ${err.stack}`,
      ),
    );

    channel.on('close', () =>
      this.logger.log(`Successfully closed a RabbitMQ channel "${name}"`),
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
        `Channel "${name}" does not exist, using default channel: ${this._managedChannel.name}.`,
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
      this.logger.log(`Canceling consumer with tag: ${consumerTag}`);
      await consumer.channel.cancel(consumerTag);
    }
  }

  public async resumeConsumer<T, U>(
    consumerTag: ConsumerTag,
  ): Promise<ConsumerTag | null> {
    const consumer = this.getConsumer(consumerTag) as ConsumerHandler<T, U>;
    if (!consumer) {
      return null;
    }
    let newConsumerTag: ConsumerTag;
    if (consumer.type === 'rpc') {
      newConsumerTag = await this.setupRpcChannel<T, U>(
        consumer.handler,
        consumer.msgOptions,
        consumer.channel,
      );
    } else if (consumer.type === 'subscribe') {
      newConsumerTag = await this.setupSubscriberChannel<T>(
        consumer.handler,
        consumer.msgOptions,
        consumer.channel,
      );
    } else if (consumer.type === 'subscribe-batch') {
      newConsumerTag = await this.setupBatchSubscriberChannel<T>(
        consumer.handler,
        consumer.msgOptions,
        consumer.channel,
      );
    } else {
      throw new Error(
        `Unable to resume consumer tag ${consumerTag}. Unexpected consumer type ${
          (consumer as any).type
        }.`,
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
        `Waiting for outstanding consumers, outstanding message count: ${this.outstandingMessageProcessing.size}`,
      );
    }
    await Promise.all(this.outstandingMessageProcessing);

    // Close all channels
    await Promise.all(managedChannels.map((channel) => channel.close()));

    await this.managedConnection.close();
  }
}
