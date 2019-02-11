import { ReflectMetadata } from '@nestjs/common';
import {
  RABBIT_HANDLER,
  RABBIT_RPC,
  RABBIT_SUBSCRIBE
} from './rabbitmq.constants';
import { RabbitHandlerConfig } from './rabbitmq.interfaces';

type RabbitDecoratorFactory = (config: RabbitHandlerConfig) => MethodDecorator;

const makeRabbitDecorator = (
  rabbitType: Symbol
): RabbitDecoratorFactory => config => (target, key, descriptor) =>
  ReflectMetadata(RABBIT_HANDLER, { type: rabbitType, config })(
    target,
    key,
    descriptor
  );
export const RabbitSubscribe = makeRabbitDecorator(RABBIT_SUBSCRIBE);
export const RabbitRPC = makeRabbitDecorator(RABBIT_RPC);
