import * as amqplib from 'amqplib';

export interface RabbitMQExchangeConfig {
  name: string;
  type?: string;
  options?: amqplib.Options.AssertExchange;
}

export interface RabbitMQConfig {
  uri: string;
  timeout?: number;
  prefetchCount?: number;
  exchanges: RabbitMQExchangeConfig[];
  defaultExchangeType?: string;
}

export type RabbitHandlerType = 'rpc' | 'subscribe';

export interface RabbitHandlerConfig {
  exchange: string;
  routingKey: string;
  type: RabbitHandlerType;
  queue?: string;
}
