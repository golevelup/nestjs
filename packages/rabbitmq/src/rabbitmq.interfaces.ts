import { LoggerService } from '@nestjs/common';
import { AmqpConnectionManagerOptions } from 'amqp-connection-manager';
import { ConsumeMessage, Options } from 'amqplib';
import {
  AssertQueueErrorHandler,
  MessageErrorHandler,
  BatchMessageErrorHandler,
  MessageHandlerErrorBehavior,
} from './amqp/errorBehaviors';

export interface RabbitMQExchangeConfig {
  name: string;
  type?: string;
  createExchangeIfNotExists?: boolean;
  options?: Options.AssertExchange;
}

export interface RabbitMQQueueConfig {
  name: string;
  createQueueIfNotExists?: boolean;
  options?: Options.AssertQueue;
  exchange?: string;
  routingKey?: string | string[];
  bindQueueArguments?: any;
}

export interface RabbitMQExchangeBindingConfig {
  destination: string;
  source: string;
  pattern: string;
  args?: any;
}

export type ConsumeOptions = Options.Consume;

export interface MessageOptions {
  exchange: string;
  routingKey: string;
}

export interface RequestOptions {
  exchange: string;
  routingKey: string;
  correlationId?: string;
  timeout?: number;
  payload?: any;
  headers?: any;
  expiration?: string | number;
  publishOptions?: Omit<
    Options.Publish,
    'replyTo' | 'correlationId' | 'headers' | 'expiration'
  >;
}

export interface QueueOptions {
  durable?: boolean;
  exclusive?: boolean;
  autoDelete?: boolean;
  arguments?: any;
  messageTtl?: number;
  expires?: number;
  deadLetterExchange?: string;
  deadLetterRoutingKey?: string;
  maxLength?: number;
  maxPriority?: number;
  bindQueueArguments?: any;
  /**
   * Set this to the name of the channel you want to consume messages from to enable this feature.
   *
   * If channel does not exist or you haven't specified one, it will use the default channel.
   *
   * For channel to exist it needs to be created in module config.
   */
  channel?: string;

  consumerOptions?: ConsumeOptions;
}

export type MessageDeserializer = (message: Buffer, msg: ConsumeMessage) => any;
export type MessageSerializer = (value: any) => Buffer;

export interface MessageHandlerOptions {
  /**
   * You can use a handler config specified in module level.
   * Just use the same key name defined there.
   */
  name?: string;
  connection?: string;
  exchange?: string;
  routingKey?: string | string[];
  queue?: string;
  queueOptions?: QueueOptions;
  /**
   * @deprecated()
   * Legacy error handling behaviors. This will be overridden if the errorHandler property is set
   */
  errorBehavior?: MessageHandlerErrorBehavior;
  /**
   * A function that will be called if an error is thrown during processing of an incoming message
   */
  errorHandler?: MessageErrorHandler;
  /**
   * A function that will be called if an error is thrown during queue creation (i.e. during channel.assertQueue)
   */
  assertQueueErrorHandler?: AssertQueueErrorHandler;
  allowNonJsonMessages?: boolean;
  createQueueIfNotExists?: boolean;

  /**
   * Indicates whether responses to requests with a 'replyTo' header should be persistent.
   * @default false - By default, responses are not persistent unless this is set to true.
   */
  usePersistentReplyTo?: boolean;

  /**
   * This function is used to deserialize the received message.
   * If set, will override the module's default deserializer.
   */
  deserializer?: MessageDeserializer;

  /**
   * Enables consumer-side batching.
   */
  batchOptions?: BatchOptions;
}

export interface ConnectionInitOptions {
  /**
   * Determines whether the application should wait for a healthy connection to be established
   * before proceeding with operations.
   *
   * - When set to `true` (default), the application will block until a connection to the RabbitMQ broker
   *   is successfully established or a timeout occurs. The `timeout` value specifies the maximum
   *   time (in milliseconds) the application will wait before giving up.
   * - When set to `false`, the application will not wait for a connection and will proceed
   *   regardless of the connection state. Health checks will be skipped in this case.
   *
   * @default true - The application will wait for a healthy connection by default.
   */
  wait?: boolean;

  /**
   * Specifies how long (in milliseconds) the application should wait for a healthy connection
   * to be established when `wait` is set to `true`. If the connection is not established within
   * this time frame, an error will be thrown or suppressed based on the `reject` option.
   *
   * @default 5000 - The application will wait for up to N milliseconds before timing out.
   */
  timeout?: number;
  /**
   * Determines the behavior when a connection fails within the specified `timeout` period.
   *
   * - When set to `true` (default), the application will throw an error if a connection
   *   cannot be established within the timeout period.
   * - When set to `false`, the application will suppress the error and continue running,
   *   treating the failed connection as a non-blocking issue.
   *
   * @default true - The application will throw an error on timeout by default.
   */
  reject?: boolean;

  /**
   * When set to `true`, suppresses logging for connection failure events.
   *
   * Use this flag to prevent connection failure logs from being written,
   * which can be useful in non-critical environments or during specific operations
   * where connection issues are expected and do not require logging.
   *
   * @default false - Connection failure logs will be written by default.
   */
  skipConnectionFailedLogging?: boolean;
}

export type RabbitMQChannels = Record<string, RabbitMQChannelConfig>;
export type RabbitMQHandlers = Record<
  string,
  MessageHandlerOptions | MessageHandlerOptions[]
>;

export interface RabbitMQConfig {
  name?: string;
  uri: string | string[];
  /**
   * Now specifies the default prefetch count for all channels.
   */
  prefetchCount?: number;
  exchanges?: RabbitMQExchangeConfig[];
  exchangeBindings?: RabbitMQExchangeBindingConfig[];
  queues?: RabbitMQQueueConfig[];
  defaultRpcTimeout?: number;
  defaultExchangeType?: string;
  defaultRpcErrorHandler?: MessageErrorHandler;
  defaultSubscribeErrorBehavior?: MessageHandlerErrorBehavior;
  connectionInitOptions?: ConnectionInitOptions;
  connectionManagerOptions?: AmqpConnectionManagerOptions;
  registerHandlers?: boolean;
  enableDirectReplyTo?: boolean;
  enableControllerDiscovery?: boolean;
  /**
   * You can optionally create channels which you consume messages from.
   *
   * By setting `prefetchCount` for a channel, you can manage message speeds of your various handlers on the same connection.
   */
  channels?: RabbitMQChannels;

  /**
   * You can pass a list with handler configs to use in the Subscription decorator
   */
  handlers?: RabbitMQHandlers;

  /**
   * You can set this property to define the default handler configuration to use
   * when using handlers.
   */
  defaultHandler?: string;

  /**
   * You can pass your implementation of the Nestjs LoggerService.
   */
  logger?: LoggerService;

  /**
   * This function is used to deserialize the received message.
   */
  deserializer?: MessageDeserializer;

  /**
   * This function is used to serialize the message to be sent.
   */
  serializer?: MessageSerializer;
}

export type RabbitHandlerType = 'rpc' | 'subscribe';

export interface RabbitHandlerConfig extends MessageHandlerOptions {
  type: RabbitHandlerType;
}

export interface RabbitMQChannelConfig {
  /**
   * Specifies prefetch count for the channel. If not specified will use the default one.
   */
  prefetchCount?: number;
  /**
   * Makes this channel the default for all handlers.
   *
   * If no channel has been marked as default, new channel will be created.
   */
  default?: boolean;
}

interface BatchOptions {
  /**
   * The number of messages to accumulate before calling the message handler.
   *
   * This should be smaller than the channel prefetch.
   *
   * Defaults to 10 if provided value is less than 2.
   *
   * @default 10
   */
  size: number;

  /**
   * The time to wait, in milliseconds, for additional messages before returning a partial batch.
   *
   * Defaults to 200 if not provided or provided value is less than 1.
   *
   * @default 200
   */
  timeout?: number;

  /**
   * A function that will be called if an error is thrown during processing of an incoming message
   */
  errorHandler?: BatchMessageErrorHandler;
}
