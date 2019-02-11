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
export interface RabbitHandlerConfig {
  exchange: string;
  routingKey: string;
}
