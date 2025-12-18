import { ConfigurableModuleBuilder } from '@nestjs/common';
import type { GraphileWorkerModuleOptions } from './graphile-worker.types.js';

export const {
  ConfigurableModuleClass: GraphileWorkerModuleClass,
  MODULE_OPTIONS_TOKEN: GRAPHILE_WORKER_MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<GraphileWorkerModuleOptions>()
  .setClassMethodName('forRoot')
  .setExtras({ global: true })
  .build();
