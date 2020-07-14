import { GraphQLClient } from 'graphql-request';
import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  mixin,
  Injectable,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { flatMap, map, tap } from 'rxjs/operators';
import { DocumentNode, print } from 'graphql';
import { HasuraAction } from './hasura.actions.interfaces';
import { InjectHasuraConfig } from './hasura.decorators';
import { HasuraModuleConfig } from './hasura.events.interfaces';

const operationIsString = (
  gqlOperation: DocumentNode | string
): gqlOperation is string => {
  return gqlOperation instanceof String;
};

/**
 * This interceptor makes it easier to implement custom business logic with Hasura actions before forwarding
 * the actual request to Hasura for evaluation.
 *
 * Intercepts the output of the decorated method and uses that output as variables with the associated GraphQL
 * operation (mutation or query). Submits the the operation and variables to Hasura with the captured Authorization
 * header so that permissions can be evaluated
 * @param gqlOperation The DocumentNode or string representing the operation that should be called against the Hasura endpoint
 */
export const ForwardOperationToHasuraInterceptor = (
  gqlOperation: DocumentNode | string
) => {
  @Injectable()
  class ForwardOperationToHasuraInterceptorMixin implements NestInterceptor {
    constructor(
      @InjectHasuraConfig() private readonly hasuraConfig: HasuraModuleConfig
    ) {}

    intercept(
      context: ExecutionContext,
      next: CallHandler<any>
    ): Observable<any> | Promise<Observable<any>> {
      const [actionInput, action, headers] = context.getArgs() as [
        Record<string, any>,
        HasuraAction,
        Record<string, string>
      ];

      const authHeader = headers['authorization'];
      // if (!authHeader) {
      //   throw new Error('Missing auth header for pass through');
      // }

      const client = new GraphQLClient(this.hasuraConfig.endpoint, {
        headers: {
          authorization: headers['authorization'],
        },
      });

      const queryText = operationIsString(gqlOperation)
        ? gqlOperation
        : print(gqlOperation);

      return next.handle().pipe(
        flatMap((variables) => from(client.request(queryText, variables))),
        map((x) => Object.entries(x as any)[0][1])
      );
    }
  }

  return mixin(ForwardOperationToHasuraInterceptorMixin);
};
