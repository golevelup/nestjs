import * as amqpConnectionManager from 'amqp-connection-manager';
import * as amqplib from 'amqplib';
import {
  AssertQueueErrorHandler,
  MessageErrorHandler,
  MessageHandlerErrorBehavior,
} from './amqp/errorBehaviors';

export interface RabbitMQExchangeConfig {
  name: string;
  type?: string;
  options?: amqplib.Options.AssertExchange;
}

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
  channel?: string;
}

export interface MessageHandlerOptions {
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
   * A function that will be called if an error is thown during queue creation (i.e during channel.assertQueue)
   */
  assertQueueErrorHandler: AssertQueueErrorHandler;
  allowNonJsonMessages?: boolean;
  createQueueIfNotExists?: boolean;
}

export interface ConnectionInitOptions {
  wait?: boolean;
  timeout?: number;
  reject?: boolean;
}

export interface RabbitMQConfig {
  uri: string | string[];
  /**
   * Now specifies the default prefetch count for all channels.
   */
  prefetchCount?: number;
  exchanges?: RabbitMQExchangeConfig[];
  defaultRpcTimeout?: number;
  defaultExchangeType?: string;
  defaultRpcErrorBehavior?: MessageHandlerErrorBehavior;
  defaultSubscribeErrorBehavior?: MessageHandlerErrorBehavior;
  connectionInitOptions?: ConnectionInitOptions;
  connectionManagerOptions?: amqpConnectionManager.AmqpConnectionManagerOptions;
  registerHandlers?: boolean;
  enableDirectReplyTo?: boolean;
  channels?: Record<string, RabbitMQChannelConfig>;
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
