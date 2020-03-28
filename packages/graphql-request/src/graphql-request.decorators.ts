import { makeInjectableDecorator } from '@golevelup/nestjs-common';
import {
  GraphQLClientConfigInject,
  GraphQLClientInject,
} from './graphql-request.constants';

/**
 * Injects the GraphQL client configuration from this module into a service/controller
 */
export const InjectGraphQLConfig = makeInjectableDecorator(
  GraphQLClientConfigInject
);

/**
 * Injects the GraphQL client provided by this module into a service/controller
 */
export const InjectGraphQLClient = makeInjectableDecorator(GraphQLClientInject);
