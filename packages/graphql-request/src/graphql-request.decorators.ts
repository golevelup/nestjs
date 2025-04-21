import { Inject } from '@nestjs/common';
import {
  GraphQLClientConfigInject,
  GraphQLClientInject,
} from './graphql-request.constants';

/**
 * Injects the GraphQL client configuration from this module into a service/controller
 */
export const InjectGraphQLConfig = () => Inject(GraphQLClientConfigInject);

/**
 * Injects the GraphQL client provided by this module into a service/controller
 */
export const InjectGraphQLClient = () => Inject(GraphQLClientInject);
