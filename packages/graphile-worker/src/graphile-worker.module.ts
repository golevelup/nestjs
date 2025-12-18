import { Module, OnModuleInit, Provider, Logger } from '@nestjs/common';
import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import {
  GRAPHILE_TASK_HANDLER,
  GRAPHILE_WORKER_UTILS_TOKEN,
  GRAPHILE_WORKER_CONTEXT_TYPE,
} from './graphile-worker.constants';
import {
  GRAPHILE_WORKER_MODULE_OPTIONS_TOKEN,
  GraphileWorkerModuleClass,
} from './graphile-worker-module-definition';
import {
  JobHelpers,
  makeWorkerUtils,
  parseCronItems,
  run,
} from 'graphile-worker';
import { fromPairs, omit } from 'lodash';
import { GraphileTaskService } from './graphile-worker.service';
import { InjectGraphileModuleOptions } from './graphile-worker.decorators';
import {
  GraphileWorkerModuleOptions,
  GraphileWorkerTaskHandlerOptions,
  GraphileWorkerTaskSchemas,
} from './graphile-worker.types';
import { ExternalContextCreator } from '@nestjs/core';
import z from 'zod';
import { RunnerLogger } from './graphile-runner.logger';
import { TaskHandlerValidationSchemaMissingError } from './task-handler-validation-schema-missing.error';

const createTaskGuard = (
  name: string,
  schema: z.ZodType,
  originalHandler: (payload: any, helpers: JobHelpers) => Promise<any>,
) => {
  return async (payload: any, helpers: JobHelpers) => {
    const parseResult = await schema.safeParseAsync(payload);
    if (!parseResult.success) {
      throw new Error(
        `Graphile task: ${name} validation failed, error: ${parseResult.error.message}`,
      );
    }

    return await originalHandler(payload, helpers);
  };
};

/**
 * These following options are not relevant/applicable to Graphile Worker utils
 */
const internalOptions = ['disabled'] as const;

const workerUtilsProvider: Provider = {
  provide: GRAPHILE_WORKER_UTILS_TOKEN,
  inject: [GRAPHILE_WORKER_MODULE_OPTIONS_TOKEN],
  useFactory: async (options: GraphileWorkerModuleOptions) => {
    const workerUtils = await makeWorkerUtils(omit(options, internalOptions));
    return workerUtils;
  },
};

@Module({
  imports: [DiscoveryModule],
  providers: [workerUtilsProvider, GraphileTaskService],
  exports: [workerUtilsProvider, GraphileTaskService],
})
export class GraphileWorkerModule
  extends GraphileWorkerModuleClass
  implements OnModuleInit
{
  private readonly logger = new Logger(GraphileWorkerModule.name);
  constructor(
    @InjectGraphileModuleOptions()
    private readonly options: GraphileWorkerModuleOptions,
    private readonly discoveryService: DiscoveryService,
    private readonly externalContextCreator: ExternalContextCreator,
  ) {
    super();
  }

  async onModuleInit() {
    if (this.options.disabled) {
      this.logger.log(
        'Graphile Worker module is disabled. Skipping worker utils initialization.',
      );
      return;
    }

    this.logger.log('Scanning for Graphile Worker task handlers...');

    const handlers =
      await this.discoveryService.providerMethodsWithMetaAtKey<GraphileWorkerTaskHandlerOptions>(
        GRAPHILE_TASK_HANDLER,
      );

    for (const handler of handlers) {
      this.logger.verbose(
        `Found handler ${handler.discoveredMethod.parentClass.name}:${handler.discoveredMethod.methodName} handling job '${handler.meta.name}'`,
      );
    }

    const parsedCronItems = parseCronItems(
      handlers
        .filter((h) => !!h.meta.cron)
        .map((h) => ({
          task: h.meta.name,
          ...h.meta.cron!,
        })),
    );

    if (parsedCronItems.length) {
      this.logger.log(
        `Found ${parsedCronItems.length} cron job(s), names: ${parsedCronItems.map((c) => `'${c.identifier}'`).toString()}]`,
      );
    }

    // Create task list with validation proxy
    const taskList = fromPairs(
      handlers.map((h) => {
        const originalHandler = this.externalContextCreator.create(
          h.discoveredMethod.parentClass.instance,
          h.discoveredMethod.handler,
          h.discoveredMethod.methodName,
          undefined, // metadataKey
          undefined, // paramsFactory
          undefined, // contextId
          undefined, // inquirerId
          undefined, // options
          GRAPHILE_WORKER_CONTEXT_TYPE,
        );

        const taskHandlerName = h.meta.name as keyof GraphileWorkerTaskSchemas;
        const schema = this.options.tasksValidationSchemas[taskHandlerName];
        if (!schema) {
          throw new TaskHandlerValidationSchemaMissingError(h.meta.name);
        }

        return [
          taskHandlerName,
          createTaskGuard(taskHandlerName, schema, originalHandler),
        ];
      }),
    );

    await run({
      ...omit(this.options, internalOptions),
      logger: RunnerLogger,
      taskList,
      parsedCronItems,
    });
  }
}
