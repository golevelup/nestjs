import { ConfigurableModuleBuilder } from '@nestjs/common';
import { GraphQLRequestModuleConfig } from './graphql-request-types.js';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<GraphQLRequestModuleConfig>()
    .setClassMethodName('forRoot')
    .build();
