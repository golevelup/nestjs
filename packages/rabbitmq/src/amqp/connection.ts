import { Logger } from '@nestjs/common';
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
import * as uuid from 'uuid';
import { defaultAssertQueueErrorHandler } from '..';
import {
  ConnectionInitOptions,
  MessageHandlerOptions,
  RabbitMQConfig,
  RequestOptions,
  RabbitMQChannelConfig,
} from '../rabbitmq.interfaces';
import {
  getHandlerForLegacyBehavior,
  MessageHandlerErrorBehavior,
} from './errorBehaviors';
import { Nack, RpcResponse, SubscribeResponse } from './handlerResponses';

const DIRECT_REPLY_QUEUE = 'amq.rabbitmq.reply-to';

export interface CorrelationMessage {
  correlationId: string;
  message: Record<string, unknown>;
}

const defaultConfig = {
  prefetchCount: 10,
  defaultExchangeType: 'topic',
  defaultRpcErrorBehavior: MessageHandlerErrorBehavior.REQUEUE,
  defaultSubscribeErrorBehavior: MessageHandlerErrorBehavior.REQUEUE,
  exchanges: [],
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
};

export class AmqpConnection {
  private readonly messageSubject = new Subject<CorrelationMessage>();
  private readonly logger = new Logger(AmqpConnection.name);
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
  private _channel!: Channel;
  private _channels: Record<string, Channel> = {};
  private _connection?: Connection;
  private readonly config: Required<RabbitMQConfig>;

  constructor(config: RabbitMQConfig) {
    this.config = { ...defaultConfig, ...config };
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
    this.logger.log('Trying to connect to a RabbitMQ broker');

    this._managedConnection = connect(
      Array.isArray(this.config.uri) ? this.config.uri : [this.config.uri],
      this.config.connectionManagerOptions
    );

    this._managedConnection.on('connect', ({ connection }) => {
      this._connection = connection;
      this.logger.log('Successfully connected to a RabbitMQ broker');
    });

    this._managedConnection.on('disconnect', ({ err }) => {
      this.logger.error('Disconnected from RabbitMQ broker', err?.stack);
    });

    const defaultChannel: { name: string; config: RabbitMQChannelConfig } = {
      name: AmqpConnection.name,
      config: {
        prefetchCount: this.config.prefetchCount,
        default: true,
      },
    };

    await Promise.all([
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
      this.config.exchanges.forEach((x) =>
        channel.assertExchange(
          x.name,
          x.type || this.config.defaultExchangeType,
          x.options
        )
      );

      if (this.config.enableDirectReplyTo) {
        await this.initDirectReplyQueue(channel);
      }

      this.initialized.next();
    }
  }

  private async initDirectReplyQueue(channel: ConfirmChannel) {
    // Set up a consumer on the Direct Reply-To queue to facilitate RPC functionality
    await channel.consume(
      DIRECT_REPLY_QUEUE,
      async (msg) => {
        if (msg == null) {
          return;
        }

        // Check that the Buffer has content, before trying to parse it
        const message =
          msg.content.length > 0
            ? JSON.parse(msg.content.toString())
            : undefined;

        const correlationMessage: CorrelationMessage = {
          correlationId: msg.properties.correlationId.toString(),
          message: message,
        };

        this.messageSubject.next(correlationMessage);
      },
      {
        noAck: true,
      }
    );
  }

  public async request<T extends Record<string, unknown>>(
    requestOptions: RequestOptions
  ): Promise<T> {
    const correlationId = requestOptions.correlationId || uuid.v4();
    const timeout = requestOptions.timeout || this.config.defaultRpcTimeout;
    const payload = requestOptions.payload || {};

    const response$ = this.messageSubject.pipe(
      filter((x) => x.correlationId === correlationId),
      map((x) => x.message as T),
      first()
    );

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

    const timeout$ = interval(timeout).pipe(
      first(),
      map(() => {
        throw new Error(
          `Failed to receive response within timeout of ${timeout}ms`
        );
      })
    );

    return lastValueFrom(race(response$, timeout$));
  }

  public async createSubscriber<T>(
    handler: (
      msg: T | undefined,
      rawMessage?: ConsumeMessage
    ) => Promise<SubscribeResponse>,
    msgOptions: MessageHandlerOptions
  ) {
    return this.selectManagedChannel(
      msgOptions?.queueOptions?.channel
    ).addSetup((channel) =>
      this.setupSubscriberChannel<T>(handler, msgOptions, channel)
    );
  }

  private async setupSubscriberChannel<T>(
    handler: (
      msg: T | undefined,
      rawMessage?: ConsumeMessage
    ) => Promise<SubscribeResponse>,
    msgOptions: MessageHandlerOptions,
    channel: ConfirmChannel
  ): Promise<void> {
    const queue = await this.setupQueue(msgOptions, channel);

    await channel.consume(queue, async (msg) => {
      try {
        if (msg == null) {
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

        if (response) {
          throw new Error(
            'Received response from subscribe handler. Subscribe handlers should only return void'
          );
        }

        channel.ack(msg);
      } catch (e) {
        if (msg == null) {
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
    });
  }

  public async createRpc<T, U>(
    handler: (
      msg: T | undefined,
      rawMessage?: ConsumeMessage
    ) => Promise<RpcResponse<U>>,
    rpcOptions: MessageHandlerOptions
  ) {
    return this.selectManagedChannel(
      rpcOptions?.queueOptions?.channel
    ).addSetup((channel) =>
      this.setupRpcChannel<T, U>(handler, rpcOptions, channel)
    );
  }

  public async setupRpcChannel<T, U>(
    handler: (
      msg: T | undefined,
      rawMessage?: ConsumeMessage
    ) => Promise<RpcResponse<U>>,
    rpcOptions: MessageHandlerOptions,
    channel: ConfirmChannel
  ) {
    const queue = await this.setupQueue(rpcOptions, channel);

    await channel.consume(queue, async (msg) => {
      try {
        if (msg == null) {
          throw new Error('Received null message');
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

        const { replyTo, correlationId, expiration, headers } = msg.properties;
        if (replyTo) {
          await this.publish('', replyTo, response, {
            correlationId,
            expiration,
            headers,
          });
        }
        channel.ack(msg);
      } catch (e) {
        if (msg == null) {
          return;
        } else {
          const errorHandler =
            rpcOptions.errorHandler ||
            getHandlerForLegacyBehavior(
              rpcOptions.errorBehavior ||
                this.config.defaultSubscribeErrorBehavior
            );

          await errorHandler(channel, msg, e);
        }
      }
    });
  }

  public async publish(
    exchange: string,
    routingKey: string,
    message: any,
    options?: Options.Publish
  ) {
    // source amqplib channel is used directly to keep the behavior of throwing connection related errors
    if (!this.managedConnection.isConnected() || !this._channel) {
      throw new Error('AMQP connection is not available');
    }

    let buffer: Buffer;
    if (message instanceof Buffer) {
      buffer = message;
    } else if (message instanceof Uint8Array) {
      buffer = Buffer.from(message);
    } else if (message != null) {
      buffer = Buffer.from(JSON.stringify(message));
    } else {
      buffer = Buffer.alloc(0);
    }

    this._channel.publish(exchange, routingKey, buffer, options);
  }

  private handleMessage<T, U>(
    handler: (msg: T | undefined, rawMessage?: ConsumeMessage) => Promise<U>,
    msg: ConsumeMessage,
    allowNonJsonMessages?: boolean
  ) {
    let message: T | undefined = undefined;
    if (msg.content) {
      if (allowNonJsonMessages) {
        try {
          message = JSON.parse(msg.content.toString()) as T;
        } catch {
          // Let handler handle parsing error, it has the raw message anyway
          message = undefined;
        }
      } else {
        message = JSON.parse(msg.content.toString()) as T;
      }
    }

    return handler(message, msg);
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
    if (subscriptionOptions.queueOptions) {
      bindQueueArguments = subscriptionOptions.queueOptions.bindQueueArguments;
    }

    const routingKeys = Array.isArray(routingKey) ? routingKey : [routingKey];

    if (exchange && routingKeys) {
      await Promise.all(
        routingKeys.map((routingKey) => {
          if (routingKey != null) {
            channel.bindQueue(
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
}
