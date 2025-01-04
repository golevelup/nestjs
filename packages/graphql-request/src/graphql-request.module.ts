import { Module } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './graphql-request-module-definition';
import { GraphQLRequestModuleConfig } from './graphql-request-types';
import { GraphQLClientInject } from './graphql-request.constants';

@Module({
  providers: [
    {
      provide: GraphQLClientInject,
      inject: [MODULE_OPTIONS_TOKEN],
      useFactory: ({ endpoint, options }: GraphQLRequestModuleConfig) => {
        return new GraphQLClient(endpoint, options);
      },
    },
  ],
})
export class GraphQLRequestModule extends ConfigurableModuleClass {}
