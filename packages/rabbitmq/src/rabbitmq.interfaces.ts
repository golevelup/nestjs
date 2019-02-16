export interface RabbitMQExchangeConfig {
  name: string;
  type?: string;
}

export interface RabbitMQConfig {
  uri: string;
  timeout?: number;
  prefetchCount?: number;
  exchanges: RabbitMQExchangeConfig[];
}

export type RabbitHandlerType = 'rpc' | 'subscribe';

export interface RabbitHandlerConfig {
  exchange: string;
  routingKey: string;
  type: RabbitHandlerType;
  queue?: string;
}
