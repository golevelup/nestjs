import * as amqplib from 'amqplib';

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
  timeout?: number;
  payload?: any;
}

export enum MessageHandlerErrorBehavior {
  ACK,
  NACK,
  REQUEUE
}

export interface MessageHandlerOptions {
  exchange: string;
  routingKey: string;
  queue?: string;
  errorBehavior?: MessageHandlerErrorBehavior;
}

export interface RabbitMQConfig {
  uri: string;
  prefetchCount?: number;
  exchanges?: RabbitMQExchangeConfig[];
  defaultRpcTimeout?: number;
  defaultExchangeType?: string;
  defaultRpcErrorBehavior?: MessageHandlerErrorBehavior;
  defaultSubscribeErrorBehavior?: MessageHandlerErrorBehavior;
}

export type RabbitHandlerType = 'rpc' | 'subscribe';

export interface RabbitHandlerConfig extends MessageHandlerOptions {
  type: RabbitHandlerType;
}
