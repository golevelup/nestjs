import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { Module } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import {
  GraphQLClientConfigInject,
  GraphQLClientInject,
} from './graphql-request.constants';

type GraphQLClientConstructorParams = ConstructorParameters<
  typeof GraphQLClient
>;

interface GraphQLRequestModuleConfig {
  endpoint: GraphQLClientConstructorParams[0];
  options?: GraphQLClientConstructorParams[1];
}

@Module({})
export class GraphQLRequestModule extends createConfigurableDynamicRootModule<
  GraphQLRequestModule,
  GraphQLRequestModuleConfig
>(GraphQLClientConfigInject, {
  providers: [
    {
      provide: GraphQLClientInject,
      useFactory: ({ endpoint, options }: GraphQLRequestModuleConfig) => {
        return new GraphQLClient(endpoint, options);
      },
      inject: [GraphQLClientConfigInject],
    },
  ],
  exports: [GraphQLClientInject],
}) {}
