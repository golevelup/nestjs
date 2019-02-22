import * as amqplib from 'amqplib';
import { interval, race, Subject } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';
import * as uuid from 'uuid';
import { RabbitMQConfig } from '../rabbitmq.interfaces';

const DIRECT_REPLY_QUEUE = 'amq.rabbitmq.reply-to';

export interface CorrelationMessage {
  correlationId: string;
  message: {};
}

export interface MessageOptions {
  exchange: string;
  routingKey: string;
  queue?: string;
}

const defaultConfig = {
  timeout: 10000,
  prefetchCount: 10,
  defaultExchangeType: 'topic'
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
          x.options,
        )
      )
    );

    await this.initDirectReplyQueue();
  }

  public async request<T extends {}>(
    messageOptions: MessageOptions,
    payload: {}
  ): Promise<T> {
    const correlationId = uuid.v4();

    const response$ = this.messageSubject.pipe(
      filter(x => x.correlationId === correlationId),
      map(x => x.message as T),
      first()
    );

    this.publish(messageOptions.exchange, messageOptions.routingKey, payload, {
      replyTo: DIRECT_REPLY_QUEUE,
      correlationId
    });

    const timeout$ = interval(this.config.timeout).pipe(
      first(),
      map(x => {
        throw new Error(
          `Failed to receive response within timeout of ${
            this.config.timeout
          }ms`
        );
      })
    );

    return race(response$, timeout$).toPromise();
  }

  public async createSubscriber<T>(
    handler: (msg: T) => Promise<void>,
    msgOptions: MessageOptions,
  ) {
    const { exchange, routingKey } = msgOptions;

    const { queue } = await this.channel.assertQueue(msgOptions.queue || '');

    await this.channel.bindQueue(queue, exchange, routingKey);

    await this.channel.consume(queue, async msg => {
      if (msg == null) {
        throw new Error('Received null message');
      }

      const message = JSON.parse(msg.content.toString()) as T;
      await handler(message);

      this._channel.ack(msg);
    });
  }

  public async createRpc<T, U>(
    handler: (msg: T) => Promise<U>,
    msgOptions: MessageOptions,
  ) {
    const { exchange, routingKey } = msgOptions;

    const { queue } = await this.channel.assertQueue(msgOptions.queue || '');

    await this.channel.bindQueue(queue, exchange, routingKey);

    await this.channel.consume(queue, async msg => {
      if (msg == null) {
        throw new Error('Received null message');
      }

      const message = JSON.parse(msg.content.toString()) as T;
      const response = await handler(message);
      const { replyTo, correlationId } = msg.properties;
      this.publish('', replyTo, response, { correlationId });

      this._channel.ack(msg);
    });
  }

  public publish(
    exchange: string,
    routingKey: string,
    message: {},
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
