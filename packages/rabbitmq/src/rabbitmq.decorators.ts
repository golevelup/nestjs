import { makeInjectableDecorator } from '@golevelup/nestjs-common';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { RABBIT_CONFIG_TOKEN, RABBIT_HANDLER } from './rabbitmq.constants';
import { RabbitHandlerConfig } from './rabbitmq.interfaces';

export const makeRabbitDecorator =
  <T extends Partial<RabbitHandlerConfig>>(input: T) =>
  (
    config: Pick<
      RabbitHandlerConfig,
      Exclude<keyof RabbitHandlerConfig, keyof T>
    >
  ) =>
    applyDecorators(SetMetadata(RABBIT_HANDLER, { ...input, ...config }));

export const RabbitHandler =
  (config: RabbitHandlerConfig) => (target, key, descriptor) =>
    SetMetadata(RABBIT_HANDLER, config)(target, key, descriptor);

export const RabbitSubscribe = makeRabbitDecorator({ type: 'subscribe' });

export const RabbitRPC = makeRabbitDecorator({ type: 'rpc' });

export const InjectRabbitMQConfig =
  makeInjectableDecorator(RABBIT_CONFIG_TOKEN);
