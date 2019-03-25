import { SetMetadata } from '@nestjs/common';
import { RABBIT_HANDLER } from './rabbitmq.constants';
import { RabbitHandlerConfig } from './rabbitmq.interfaces';

export const makeRabbitDecorator = <T extends Partial<RabbitHandlerConfig>>(
  input: T
) => (
  config: Pick<RabbitHandlerConfig, Exclude<keyof RabbitHandlerConfig, keyof T>>
) => (target, key, descriptor) =>
  SetMetadata(RABBIT_HANDLER, { ...input, ...config })(target, key, descriptor);

export const RabbitHandler = (config: RabbitHandlerConfig) => (
  target,
  key,
  descriptor
) => SetMetadata(RABBIT_HANDLER, config)(target, key, descriptor);

export const RabbitSubscribe = makeRabbitDecorator({ type: 'subscribe' });

export const RabbitRPC = makeRabbitDecorator({ type: 'rpc' });
