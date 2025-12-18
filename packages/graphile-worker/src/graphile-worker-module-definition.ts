import { ConfigurableModuleBuilder } from '@nestjs/common';
import { GraphileWorkerModuleOptions } from './graphile-worker.types';

export const {
  ConfigurableModuleClass: GraphileWorkerModuleClass,
  MODULE_OPTIONS_TOKEN: GRAPHILE_WORKER_MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<GraphileWorkerModuleOptions>()
  .setClassMethodName('forRoot')
  .setExtras({ global: true })
  .build();
