import { MiddlewareConsumer, Type } from '@nestjs/common';
import { RouteInfo } from '@nestjs/common/interfaces';
import {
  ConfigurableRawBodyMiddleware,
  JsonBodyMiddleware,
  RawBodyMiddleware,
} from './webhooks.middleware';

export const applyRawBodyWebhookMiddleware = (
  consumer: MiddlewareConsumer,
  rawBodyRoutes: (string | Type<any> | RouteInfo)[],
  jsonBodyRoutes: (string | Type<any> | RouteInfo)[]
) => {
  consumer
    .apply(RawBodyMiddleware)
    .forRoutes(...rawBodyRoutes)
    .apply(JsonBodyMiddleware)
    .forRoutes(...jsonBodyRoutes);
};

export const applyRawBodyOnlyTo = (
  consumer: MiddlewareConsumer,
  ...rawBodyRoutes: (string | RouteInfo)[]
) => {
  consumer
    .apply(RawBodyMiddleware)
    .forRoutes(...rawBodyRoutes)
    .apply(JsonBodyMiddleware)
    .exclude(...rawBodyRoutes)
    .forRoutes('*');
};

/**
 * Applies raw body middleware to routes that saves the raw body on the request object based on
 * the WebhooksModule configuration. Also adds JSON body parsing to supplied routes
 *
 * @param consumer Middleware consumer
 * @param rawBodyRoutes The routes that should have raw body processing added to them
 * @param jsonBodyRoutes The routes that should have JSON body processing added to them. Defaults to * (all routes)
 */
export const applyConfigurableRawBodyWebhookMiddleware = (
  consumer: MiddlewareConsumer,
  rawBodyRoutes: (string | Type<any> | RouteInfo)[],
  jsonBodyRoutes: (string | Type<any> | RouteInfo)[] = ['*']
) => {
  consumer
    .apply(ConfigurableRawBodyMiddleware)
    .forRoutes(...rawBodyRoutes)
    .apply(JsonBodyMiddleware)
    .forRoutes(...jsonBodyRoutes);
};
