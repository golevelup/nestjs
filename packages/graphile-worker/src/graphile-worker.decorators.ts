import { makeInjectableDecorator } from '@golevelup/nestjs-common';
import { SetMetadata } from '@nestjs/common';
import {
  GRAPHILE_WORKER_CONFIG_TOKEN,
  GRAPHILE_WORKER_HANDLER_TOKEN,
  GRAPHILE_WORKER_UTILS_TOKEN,
} from './graphile-worker.constants';
import { CronItem } from 'graphile-worker';
import { GraphileWorkerHandlerOptions } from './graphile-worker.interfaces';

export const GraphileWorkerHandler = (config: GraphileWorkerHandlerOptions) =>
  SetMetadata(GRAPHILE_WORKER_HANDLER_TOKEN, config);

export const InjectGraphileWorkerConfig = makeInjectableDecorator(
  GRAPHILE_WORKER_CONFIG_TOKEN
);

export const InjectGraphileWorkerUtils = makeInjectableDecorator(
  GRAPHILE_WORKER_UTILS_TOKEN
);
