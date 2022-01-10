# @golevelup/nestjs-graphql-request

<p align="center">
<a href="https://www.npmjs.com/package/@golevelup/nestjs-graphql-request"><img src="https://img.shields.io/npm/v/@golevelup/nestjs-graphql-request.svg?style=flat" alt="version" /></a>
<a href="https://www.npmjs.com/package/@golevelup/nestjs-graphql-request"><img alt="downloads" src="https://img.shields.io/npm/dt/@golevelup/nestjs-graphql-request.svg?style=flat"></a>
<img alt="license" src="https://img.shields.io/npm/l/@golevelup/nestjs-graphql-request.svg">
</p>

## Description

This library provides the `GraphQLRequestModule` which makes it easy to initialize an instance of `GraphQLClient` for use in Depdendency Injection. This can be combined with automatic codegen for type safe access to third party GQL APIs from your Nest services

## Usage

### Install

`npm install ---save @golevelup/nestjs-graphql-request`

or

`yarn add @golevelup/nestjs-graphql-request`

### Import

Import and add `GraphQLRequestModule` to the `imports` section of the consuming module.

```typescript
import { GraphQLRequestModule } from '@golevelup/nestjs-graphql-request';

@Module({
  imports: [
    GraphQLRequestModule.forRoot(GraphQLRequestModule, {
      // Exposes configuration options based on the graphql-request package
      endpoint: config.get('endpoint'),
      options: {
        headers: {
          'content-type': 'application/json',
          'x-hasura-admin-secret': config.get('secret'),
        },
      },
    }),
  ],
})
export class AppModule {
  // ...
}
```

### Inject the GraphQLClient

To make GraphQL requests from your controllers or services use the provided decorator `@InjectGraphQLClient`.

```typescript
import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import { GraphQLClient } from 'graphql-request';

@Injectable()
export class ExampleService {
  constructor(@InjectGraphQLClient() private readonly client: GraphQLClient) {}
}
```

### Typesafe GraphQL Access

The GraphQL client works best when combined with GraphQL code generation tools for communicating to a GraphQL endpoint. Follow the [GraphQL Code Generator GraphQL Request Plugin Instructions](https://graphql-code-generator.com/docs/plugins/typescript-graphql-request).

Running the code generator against a GraphQL Endpoint will produce typescript interfaces for all operations and types exposed by the API as well as a `getSdk` function which you can use in conjunction with GraphQL Request to get intellisense and type saftey for all requests you make. The `getSdk` function only requires a GraphQLClient instance (which this library provides). However because each generated SDK is unique per endpoint, it's up to you to wire up the provider for this in your application. This can be done using a Provider Factory with minimal code.

```typescript
import {
  GraphQLRequestModule,
  GraphQLClientInject,
} from '@golevelup/nestjs-graphql-request';
import { getSdk } from './your-codegen-location';

@Module({
  imports: [
    GraphQLRequestModule.forRoot(GraphQLRequestModule, {
      // Exposes configuration options based on the graphql-request package
      endpoint: config.get('endpoint'),
      options: {
        headers: {
          'content-type': 'application/json',
          'x-hasura-admin-secret': config.get('secret'),
        },
      },
    }),
  ],
  providers: [
    {
      // you can provide whatever key you want. use it in conjunction with @Inject("TypeSafeGqlSdk") to get the SDK instance in your controllers/services
      provide: 'TypeSafeGqlSdk',
      inject: [GraphQLClientInject],
      useFactory: (client: GraphQLClient) => getSdk(client),
    },
  ],
})
export class AppModule {
  // ...
}
```

## Contribute

Contributions welcome! Read the [contribution guidelines](../../CONTRIBUTING.md) first.

## License

[MIT License](../../LICENSE)
