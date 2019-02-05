import { ReflectMetadata } from '@nestjs/common';
import { RABBIT_RPC, RABBIT_SUBSCRIBE } from './rabbitmq.constants';

export const placeholder = () => 42;

type RabbitDecoratorFactory = () => MethodDecorator;

const makeRabbitDecorator = (
  rabbitType: Symbol
): RabbitDecoratorFactory => () => (target, key, descriptor) =>
  ReflectMetadata('someKey', { type: rabbitType })(target, key, descriptor);

export const RabbitSubscribe = makeRabbitDecorator(RABBIT_SUBSCRIBE);
export const RabbitRPC = makeRabbitDecorator(RABBIT_RPC);
