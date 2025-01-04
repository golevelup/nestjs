import { ConfigurableModuleBuilder } from '@nestjs/common';
import { GraphQLRequestModuleConfig } from './graphql-request-types';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<GraphQLRequestModuleConfig>()
  .setClassMethodName('forRoot')
  .build();
