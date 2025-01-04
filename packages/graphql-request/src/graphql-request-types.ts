import { GraphQLClient } from 'graphql-request';

type GraphQLClientConstructorParams = ConstructorParameters<
  typeof GraphQLClient
>;

export interface GraphQLRequestModuleConfig {
  endpoint: GraphQLClientConstructorParams[0];
  options?: GraphQLClientConstructorParams[1];
}
