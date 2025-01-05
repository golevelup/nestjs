import { ConfigurableModuleBuilder } from '@nestjs/common';
import { HasuraModuleConfig } from './hasura.interfaces';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<HasuraModuleConfig>()
    .setClassMethodName('forRoot')
    .build();
