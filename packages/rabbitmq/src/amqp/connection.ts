import * as amqplib from 'amqplib';
import { interval, race, Subject } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';
import * as uuid from 'uuid';
import * as amqpcon from 'amqp-connection-manager';
import {
  MessageHandlerErrorBehavior,
  MessageHandlerOptions,
  RabbitMQConfig,
  RequestOptions
} from '../rabbitmq.interfaces';
import { Nack, RpcResponse, SubscribeResponse } from './handlerResponses';
import { Logger } from '@nestjs/common';

const DIRECT_REPLY_QUEUE = 'amq.rabbitmq.reply-to';

export interface CorrelationMessage {
  correlationId: string;
  message: {};
}

const defaultConfig = {
  prefetchCount: 10,
  defaultExchangeType: 'topic',
  defaultRpcErrorBehavior: MessageHandlerErrorBehavior.REQUEUE,
  defaultSubscribeErrorBehavior: MessageHandlerErrorBehavior.REQUEUE,
  exchanges: [],
  defaultRpcTimeout: 10000,
  connectionManager: {}
};

export class AmqpConnection {
  private readonly messageSubject = new Subject<CorrelationMessage>();
  private readonly config: Required<RabbitMQConfig>;
  private readonly logger: Logger;
  private _connection!: amqpcon.AmqpConnectionManager;
  private _channel!: amqpcon.ChannelWrapper;
  private _rawChannel?: amqplib.Channel;

  constructor(config: RabbitMQConfig) {
    this.config = { ...defaultConfig, ...config };
    this.logger = new Logger(AmqpConnection.name);
  }

  get channel() {
    return this._channel;
  }

  get rawChannel() {
    return this._rawChannel;
  }

  get connection() {
    return this._connection;
  }

  public async init(timeout = 3000): Promise<boolean> {
    const connectAsync = new Promise<boolean>(async res => {
      this._connection = amqpcon.connect(
        Array.isArray(this.config.uri) ? this.config.uri : [this.config.uri],
        this.config.connectionManager
      );

      this.logger.log('Trying to connect to a RabbitMQ broker');
      this._connection.on('connect', () => {
        this.logger.log('Successfully connected to a RabbitMQ broker');
      });

      this._channel = this._connection.createChannel({
        name: AmqpConnection.name
      });

      this._channel.on('connect', () => {
        res(true);
        this.logger.log('Successfully connected a RabbitMQ channel');
      });
      this._channel.on('error', (err, { name }) => {
        this._rawChannel = undefined;
        this.logger.log(
          `Failed to setup a RabbitMQ channel - name: ${name} / error: ${
            err.message
          } ${err.stack}`
        );
      });
      this._channel.on('close', () => {
        this._rawChannel = undefined;
        this.logger.log('Successfully closed a RabbitMQ channel');
      });

      await this._channel.addSetup(this.setupInitChannel.bind(this));
    });

    const timeoutAsync = new Promise<boolean>(res =>
      setTimeout(() => res(false), timeout)
    );
    return Promise.race<boolean>([connectAsync, timeoutAsync]);
  }

  private async setupInitChannel(
    channel: amqplib.ConfirmChannel
  ): Promise<void> {
    this._rawChannel = channel;

    this.config.exchanges.map(async x =>
      channel.assertExchange(
        x.name,
        x.type || this.config.defaultExchangeType,
        x.options
      )
    );

    await channel.prefetch(this.config.prefetchCount);
    await this.initDirectReplyQueue(channel);
  }

  private async initDirectReplyQueue(channel: amqplib.ConfirmChannel) {
    // Set up a consumer on the Direct Reply-To queue to facilitate RPC functionality
    await channel.consume(
      DIRECT_REPLY_QUEUE,
      async msg => {
        if (msg == null) {
          return;
        }

        const correlationMessage: CorrelationMessage = {
          correlationId: msg.properties.correlationId.toString(),
          message: JSON.parse(msg.content.toString())
        };

        this.messageSubject.next(correlationMessage);
      },
      {
        noAck: true
      }
    );
  }

  public async request<T extends {}>(
    requestOptions: RequestOptions
  ): Promise<T> {
    const correlationId = uuid.v4();
    const timeout = requestOptions.timeout || this.config.defaultRpcTimeout;
    const payload = requestOptions.payload || {};

    const response$ = this.messageSubject.pipe(
      filter(x => x.correlationId === correlationId),
      map(x => x.message as T),
      first()
    );

    this.publish(requestOptions.exchange, requestOptions.routingKey, payload, {
      replyTo: DIRECT_REPLY_QUEUE,
      correlationId
    });

    const timeout$ = interval(timeout).pipe(
      first(),
      map(() => {
        throw new Error(
          `Failed to receive response within timeout of ${timeout}ms`
        );
      })
    );

    return race(response$, timeout$).toPromise();
  }

  public async createSubscriber<T>(
    handler: (
      msg: T,
      rawMessage?: amqplib.ConsumeMessage
    ) => Promise<SubscribeResponse>,
    msgOptions: MessageHandlerOptions
  ) {
    return this._channel.addSetup(channel =>
      this.setupSubscriberChannel<T>(handler, msgOptions, channel)
    );
  }

  private async setupSubscriberChannel<T>(
    handler: (
      msg: T,
      rawMessage?: amqplib.ConsumeMessage
    ) => Promise<SubscribeResponse>,
    msgOptions: MessageHandlerOptions,
    channel: amqplib.ConfirmChannel
  ): Promise<void> {
    const { exchange, routingKey } = msgOptions;

    const { queue } = await channel.assertQueue(
      msgOptions.queue || '',
      msgOptions.queueOptions || undefined
    );

    const routingKeys = Array.isArray(routingKey) ? routingKey : [routingKey];

    await Promise.all(
      routingKeys.map(x => channel.bindQueue(queue, exchange, x))
    );

    await channel.consume(queue, async msg => {
      try {
        if (msg == null) {
          throw new Error('Received null message');
        }

        const message = JSON.parse(msg.content.toString()) as T;
        const response = await handler(message, msg);
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
          const errorBehavior =
            msgOptions.errorBehavior ||
            this.config.defaultSubscribeErrorBehavior;
          switch (errorBehavior) {
            case MessageHandlerErrorBehavior.ACK: {
              channel.ack(msg);
              break;
            }
            case MessageHandlerErrorBehavior.REQUEUE: {
              channel.nack(msg, false, true);
              break;
            }
            default:
              channel.nack(msg, false, false);
          }
        }
      }
    });
  }

  public async createRpc<T, U>(
    handler: (
      msg: T,
      rawMessage?: amqplib.ConsumeMessage
    ) => Promise<RpcResponse<U>>,
    rpcOptions: MessageHandlerOptions
  ) {
    return this._channel.addSetup(channel =>
      this.setupRpcChannel<T, U>(handler, rpcOptions, channel)
    );
  }

  public async setupRpcChannel<T, U>(
    handler: (
      msg: T,
      rawMessage?: amqplib.ConsumeMessage
    ) => Promise<RpcResponse<U>>,
    rpcOptions: MessageHandlerOptions,
    channel: amqplib.ConfirmChannel
  ) {
    const { exchange, routingKey } = rpcOptions;

    const { queue } = await channel.assertQueue(
      rpcOptions.queue || '',
      rpcOptions.queueOptions || undefined
    );

    const routingKeys = Array.isArray(routingKey) ? routingKey : [routingKey];

    await Promise.all(
      routingKeys.map(x => channel.bindQueue(queue, exchange, x))
    );

    await channel.consume(queue, async msg => {
      try {
        if (msg == null) {
          throw new Error('Received null message');
        }

        const message = JSON.parse(msg.content.toString()) as T;
        const response = await handler(message, msg);

        if (response instanceof Nack) {
          channel.nack(msg, false, response.requeue);
          return;
        }

        const { replyTo, correlationId } = msg.properties;
        if (replyTo) {
          this.publish('', replyTo, response, { correlationId });
        }
        channel.ack(msg);
      } catch (e) {
        if (msg == null) {
          return;
        } else {
          const errorBehavior =
            rpcOptions.errorBehavior || this.config.defaultRpcErrorBehavior;
          switch (errorBehavior) {
            case MessageHandlerErrorBehavior.ACK: {
              channel.ack(msg);
              break;
            }
            case MessageHandlerErrorBehavior.REQUEUE: {
              channel.nack(msg, false, true);
              break;
            }
            default:
              channel.nack(msg, false, false);
          }
        }
      }
    });
  }

  public async publish(
    exchange: string,
    routingKey: string,
    message: any,
    options?: amqplib.Options.Publish
  ) {
    // raw amqplib channel is used to follow behavior of throwing connection errors in this case
    if (!this.connection.isConnected || !this._rawChannel) {
      throw new Error('AMQP connection is not available');
    }

    this._rawChannel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      options
    );
  }
}
