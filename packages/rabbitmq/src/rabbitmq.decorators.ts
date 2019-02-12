import { ReflectMetadata } from '@nestjs/common';
import { RABBIT_HANDLER } from './rabbitmq.constants';
import { RabbitHandlerConfig, RabbitHandlerType } from './rabbitmq.interfaces';

export const makeRabbitDecorator = (type: RabbitHandlerType) => (
  config: Pick<RabbitHandlerConfig, Exclude<keyof RabbitHandlerConfig, 'type'>>
) => (target, key, descriptor) =>
  ReflectMetadata(RABBIT_HANDLER, { type, ...config })(target, key, descriptor);

export const RabbitHandler = (config: RabbitHandlerConfig) => (
  target,
  key,
  descriptor
) => ReflectMetadata(RABBIT_HANDLER, config)(target, key, descriptor);

export const RabbitSubscribe = makeRabbitDecorator('subscribe');

export const RabbitRPC = makeRabbitDecorator('rpc');
