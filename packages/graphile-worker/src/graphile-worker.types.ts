import type { CronItem, RunnerOptions } from 'graphile-worker';
import type { ZodType } from 'zod';

export type GraphileWorkerModuleOptions = Omit<
  RunnerOptions,
  'taskList' | 'taskDirectory' | 'parsedCronItems' | 'cronTab' | 'cronTabFile'
> & {
  /**
   * Whether the module should be disabled.
   * This is useful in standalone environments
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Zod validation schemas for registered tasks
   * If a registered task does not have a corresponding schema, an error will be thrown when initializing the module
   */
  tasksValidationSchemas: TaskSchemaMap;
};

export type GraphileCronOptions = Pick<
  GraphileWorkerTaskHandlerOptions,
  'name'
> &
  NonNullable<GraphileWorkerTaskHandlerOptions['cron']>;

/**
 * Extendable interface for registering task names
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GraphileWorkerTaskSchemas {}

export type TaskSchemaMap = {
  [K in keyof GraphileWorkerTaskSchemas]: ZodType<GraphileWorkerTaskSchemas[K]>;
};

export type GraphileWorkerTaskHandlerOptions = {
  name: keyof GraphileWorkerTaskSchemas;
  cron?: Omit<CronItem, 'task'>;
};
