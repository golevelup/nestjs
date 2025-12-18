import { Inject, SetMetadata } from '@nestjs/common';
import {
  GraphileCronOptions,
  GraphileWorkerTaskHandlerOptions,
} from './graphile-worker.types';
import {
  GRAPHILE_TASK_HANDLER,
  GRAPHILE_WORKER_UTILS_TOKEN,
} from './graphile-worker.constants';
import { GRAPHILE_WORKER_MODULE_OPTIONS_TOKEN } from './graphile-worker-module-definition';

/**
 * Decorator for defining a task handler.
 *
 * @example
 * ```typescript
 * import { GraphileTaskHandler } from '@golevelup/nestjs-graphile-worker';
 *
 * @GraphileTaskHandler({
 *   name: 'my-task',
 * })
 * async handleMyTask(payload: YourPayloadType, helpers: JobHelpers) {
 *   // Your business logic here
 * }
 * ```
 * @param config - {@link GraphileWorkerTaskHandlerOptions}
 */
export const GraphileTaskHandler = (config: GraphileWorkerTaskHandlerOptions) =>
  SetMetadata(GRAPHILE_TASK_HANDLER, config);

/**
 * Decorator for defining a cron task.
 *
 * @example
 * ```typescript
 * import { GraphileTaskCron } from '@golevelup/nestjs-graphile-worker';
 *
 * @GraphileTaskCron({
 *   name: 'my-cron-task',
 *   cron: { minute: '* * * * *' },
 * })
 * async handleMyCronTask(payload: YourPayloadType, helpers: JobHelpers) {
 *   // Your business logic here
 * }
 * ```
 *
 * @param options - {@link GraphileCronOptions}
 */
export const GraphileTaskCron = ({ name, ...cron }: GraphileCronOptions) => {
  const typeSafeConfig: GraphileWorkerTaskHandlerOptions = {
    name,
    cron,
  };

  return SetMetadata(GRAPHILE_TASK_HANDLER, typeSafeConfig);
};

export const InjectGraphileWorkerUtils = () =>
  Inject(GRAPHILE_WORKER_UTILS_TOKEN);

export const InjectGraphileModuleOptions = () =>
  Inject(GRAPHILE_WORKER_MODULE_OPTIONS_TOKEN);
