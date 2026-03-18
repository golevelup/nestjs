import { Injectable } from '@nestjs/common';
import {
  InjectGraphileWorkerUtils,
  InjectGraphileModuleOptions,
} from './graphile-worker.decorators.js';
import { TaskSpec, WorkerUtils } from 'graphile-worker';
import {
  GraphileWorkerModuleOptions,
  GraphileWorkerTaskSchemas,
} from './graphile-worker.types.js';
import { randomUUID } from 'crypto';
import { TaskHandlerValidationSchemaMissingError } from './task-handler-validation-schema-missing.error.js';

@Injectable()
export class GraphileTaskService {
  constructor(
    @InjectGraphileWorkerUtils() private readonly utils: WorkerUtils,
    @InjectGraphileModuleOptions()
    private readonly options: GraphileWorkerModuleOptions,
  ) {}

  /**
   * A type-safe method to schedule a task with optional payload validation
   *
   * @param taskName
   * @param data
   * @param options
   * @returns job - Graphile Worker Job
   */
  public async scheduleTask<TaskName extends keyof GraphileWorkerTaskSchemas>(
    taskName: TaskName,
    data: GraphileWorkerTaskSchemas[TaskName],
    options?: TaskSpec,
  ) {
    const targetSchema = this.options.tasksValidationSchemas[taskName];

    // The module initialization should have already thrown an error if a schema is missing
    // but when the service is used directly, we need to ensure the same check for consistency
    if (!targetSchema) {
      throw new TaskHandlerValidationSchemaMissingError(taskName);
    }

    const parseResult = targetSchema.safeParse(data);
    if (!parseResult.success) {
      throw new Error(
        `Invalid payload for task "${String(taskName)}": ${parseResult.error.message}`,
      );
    }

    return this.utils.addJob(taskName, data as any, {
      ...options,
      jobKey: options?.jobKey ?? randomUUID(),
    });
  }
}
