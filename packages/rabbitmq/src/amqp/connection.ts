import * as amqplib from 'amqplib';
import { interval, race, Subject } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';
import * as uuid from 'uuid';
import {
  MessageHandlerErrorBehavior,
  MessageHandlerOptions,
  RabbitMQConfig,
  RequestOptions
} from '../rabbitmq.interfaces';
import { Nack, RpcResponse, SubscribeResponse } from './handlerResponses';

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
  defaultRpcTimeout: 10000
};

export class AmqpConnection {
  private messageSubject = new Subject<CorrelationMessage>();
  private _connection!: amqplib.Connection;
  private _channel!: amqplib.Channel;
  private config: Required<RabbitMQConfig>;
  constructor(config: RabbitMQConfig) {
    this.config = { ...defaultConfig, ...config };
  }

  get channel() {
    return this._channel;
  }

  get connection() {
    return this._connection;
  }

  public async init() {
    this._connection = await amqplib.connect(this.config.uri);
    this._channel = await this._connection.createChannel();

    await Promise.all(
      this.config.exchanges.map(async x =>
        this._channel.assertExchange(
          x.name,
          x.type || this.config.defaultExchangeType,
          x.options
        )
      )
    );

    await this.channel.prefetch(this.config.prefetchCount);

    await this.initDirectReplyQueue();
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
      map(x => {
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
    const { exchange, routingKey } = msgOptions;

    const { queue } = await this.channel.assertQueue(
      msgOptions.queue || '',
      msgOptions.queueOptions || undefined
    );

    const routingKeys = Array.isArray(routingKey) ? routingKey : [routingKey];

    await Promise.all(
      routingKeys.map(x => this.channel.bindQueue(queue, exchange, x))
    );

    await this.channel.consume(queue, async msg => {
      try {
        if (msg == null) {
          throw new Error('Received null message');
        }

        const message = JSON.parse(msg.content.toString()) as T;
        const response = await handler(message, msg);
        if (response instanceof Nack) {
          this._channel.nack(msg, false, response.requeue);
          return;
        }

        if (response) {
          throw new Error(
            'Received response from subscribe handler. Subscribe handlers should only return void'
          );
        }

        this._channel.ack(msg);
      } catch (e) {
        if (msg == null) {
          return;
        } else {
          const errorBehavior =
            msgOptions.errorBehavior ||
            this.config.defaultSubscribeErrorBehavior;
          switch (errorBehavior) {
            case MessageHandlerErrorBehavior.ACK: {
              this._channel.ack(msg);
              break;
            }
            case MessageHandlerErrorBehavior.REQUEUE: {
              this._channel.nack(msg, false, true);
              break;
            }
            default:
              this._channel.nack(msg, false, false);
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
    const { exchange, routingKey } = rpcOptions;

    const { queue } = await this.channel.assertQueue(
      rpcOptions.queue || '',
      rpcOptions.queueOptions || undefined
    );

    const routingKeys = Array.isArray(routingKey) ? routingKey : [routingKey];

    await Promise.all(
      routingKeys.map(x => this.channel.bindQueue(queue, exchange, x))
    );

    await this.channel.consume(queue, async msg => {
      try {
        if (msg == null) {
          throw new Error('Received null message');
        }

        const message = JSON.parse(msg.content.toString()) as T;
        const response = await handler(message, msg);

        if (response instanceof Nack) {
          this._channel.nack(msg, false, response.requeue);
          return;
        }

        const { replyTo, correlationId } = msg.properties;
        if (replyTo) {
          this.publish('', replyTo, response, { correlationId });
        }
        this._channel.ack(msg);
      } catch (e) {
        if (msg == null) {
          return;
        } else {
          const errorBehavior =
            rpcOptions.errorBehavior || this.config.defaultRpcErrorBehavior;
          switch (errorBehavior) {
            case MessageHandlerErrorBehavior.ACK: {
              this._channel.ack(msg);
              break;
            }
            case MessageHandlerErrorBehavior.REQUEUE: {
              this._channel.nack(msg, false, true);
              break;
            }
            default:
              this._channel.nack(msg, false, false);
          }
        }
      }
    });
  }

  public publish(
    exchange: string,
    routingKey: string,
    message: any,
    options?: amqplib.Options.Publish
  ) {
    this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      options
    );
  }

  private async initDirectReplyQueue() {
    // Set up a consumer on the Direct Reply-To queue to facilitate RPC functionality
    await this._channel.consume(
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
}
