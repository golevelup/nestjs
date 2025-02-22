import 'reflect-metadata';
import {
  applyDecorators,
  SetMetadata,
  PipeTransform,
  Type,
  assignMetadata,
  Inject,
} from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { isString } from 'lodash';
import {
  RABBIT_CONFIG_TOKEN,
  RABBIT_HANDLER,
  RABBIT_HEADER_TYPE,
  RABBIT_PARAM_TYPE,
  RABBIT_REQUEST_TYPE,
} from './rabbitmq.constants';
import { RabbitHandlerConfig } from './rabbitmq.interfaces';

export const makeRabbitDecorator =
  <T extends Partial<RabbitHandlerConfig>>(input: T) =>
  (
    config: Pick<
      RabbitHandlerConfig,
      Exclude<keyof RabbitHandlerConfig, keyof T>
    >,
  ) =>
    applyDecorators(SetMetadata(RABBIT_HANDLER, { ...input, ...config }));

export const RabbitHandler =
  (config: RabbitHandlerConfig) => (target, key, descriptor) =>
    SetMetadata(RABBIT_HANDLER, config)(target, key, descriptor);

export const RabbitSubscribe = makeRabbitDecorator({ type: 'subscribe' });

export const RabbitRPC = makeRabbitDecorator({ type: 'rpc' });

export const InjectRabbitMQConfig = () => Inject(RABBIT_CONFIG_TOKEN);

export const createPipesRpcParamDecorator =
  (
    data?: any,
    type: number = RABBIT_PARAM_TYPE,
    ...pipes: (Type<PipeTransform> | PipeTransform)[]
  ): ParameterDecorator =>
  (target, key, index) => {
    if (!key) {
      throw new Error(`Failed creating rpc pipes param, received key: ${key}`);
    }

    const args =
      Reflect.getMetadata(ROUTE_ARGS_METADATA, target.constructor, key) || {};

    const hasParamData = isString(data);
    const paramData = hasParamData ? data : undefined;
    const paramPipes = hasParamData ? pipes : [data, ...pipes];

    Reflect.defineMetadata(
      ROUTE_ARGS_METADATA,
      assignMetadata(args, type, index, paramData, ...paramPipes),
      target.constructor,
      key,
    );
  };

export function RabbitPayload(): ParameterDecorator;
export function RabbitPayload(
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator;
export function RabbitPayload(
  propertyKey?: string,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator;
export function RabbitPayload(
  propertyOrPipe?: string | (Type<PipeTransform> | PipeTransform),
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
  return createPipesRpcParamDecorator(
    propertyOrPipe,
    RABBIT_PARAM_TYPE,
    ...pipes,
  );
}

export function RabbitHeader(): ParameterDecorator;
export function RabbitHeader(
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator;
export function RabbitHeader(
  propertyKey?: string,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator;
export function RabbitHeader(
  propertyOrPipe?: string | (Type<PipeTransform> | PipeTransform),
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
  return createPipesRpcParamDecorator(
    propertyOrPipe,
    RABBIT_HEADER_TYPE,
    ...pipes,
  );
}

export function RabbitRequest(): ParameterDecorator;
export function RabbitRequest(
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator;
export function RabbitRequest(
  propertyKey?: string,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator;
export function RabbitRequest(
  propertyOrPipe?: string | (Type<PipeTransform> | PipeTransform),
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
  return createPipesRpcParamDecorator(
    propertyOrPipe,
    RABBIT_REQUEST_TYPE,
    ...pipes,
  );
}
