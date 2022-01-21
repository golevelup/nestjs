import { AmqpConnectionManagerOptions } from 'amqp-connection-manager';
import { Options } from 'amqplib';

import {
  AssertQueueErrorHandler,
  MessageErrorHandler,
  MessageHandlerErrorBehavior,
} from './amqp/errorBehaviors';

export interface RabbitMQExchangeConfig {
  name: string;
  type?: string;
  options?: Options.AssertExchange;
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
  headers?: any;
  expiration?: string | number;
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
   * A function that will be called if an error is thrown during queue creation (i.e. during channel.assertQueue)
   */
  assertQueueErrorHandler?: AssertQueueErrorHandler;
  allowNonJsonMessages?: boolean;
  createQueueIfNotExists?: boolean;
}

export interface ConnectionInitOptions {
  wait?: boolean;
  timeout?: number;
  reject?: boolean;
}

export type RabbitMQChannels = Record<string, RabbitMQChannelConfig>;

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
  connectionManagerOptions?: AmqpConnectionManagerOptions;
  registerHandlers?: boolean;
  enableDirectReplyTo?: boolean;
  /**
   * You can optionally create channels which you consume messages from.
   *
   * By setting `prefetchCount` for a channel, you can manage message speeds of your various handlers on the same connection.
   */
  channels?: RabbitMQChannels;
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