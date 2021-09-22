import { CronItem, RunnerOptions } from 'graphile-worker';

export type GraphileWorkerConfig = Omit<
  RunnerOptions,
  'taskList' | 'taskDirectory' | 'parsedCronItems' | 'cronTab' | 'cronTabFile'
>;

export type GraphileWorkerHandlerOptions = {
  name: string;
  cron?: Omit<CronItem, 'task'>;
};
