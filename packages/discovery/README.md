# @nestjs-plus/discovery

<p align="center">
<a href="https://www.npmjs.com/package/@nestjs-plus/discovery"><img src="https://img.shields.io/npm/v/@nestjs-plus/discovery.svg?style=flat" alt="version" /></a>
<a href="https://www.npmjs.com/package/@nestjs-plus/discovery"><img alt="downloads" src="https://img.shields.io/npm/dt/@nestjs-plus/discovery.svg?style=flat"></a>
<img alt="license" src="https://img.shields.io/npm/l/@nestjs-plus/discovery.svg">
</p>

## Description

This module provides access to the `DiscoveryService` which can be used to query the various modules, providers, controllers and handlers that make up your NestJS application.

## Motivation

When building modules that extend NestJS functionality, it's common to use custom `Decorators` to attach metadata to different parts of the application. Once metdata is attached, the module will then need to be able to "discover" all the metadata to be able to connect it's functionality. For example, the official `@nestjs/graphql` package needs to be able to discover all the `@Mutation` and `@Resolver` decorated classes in order to properly build the GraphQL schema.

NestJS provides the `MetadataScanner` class to be able to retrieve this data but doesn't expose a friendly API to be able to easily and quickly find the components in question. The `DiscoveryService` fills this gap by exposing common discovery patterns that can be used when building module extensions to NestJS

## Usage

### Install

`npm install ---save @nestjs-plus/discovery`

or

`yarn add @nestjs-plus/discovery`

### Import

Import and add `DiscoveryModule` to the `imports` section of the module you wish to implement Discovery features in. It's common to inject it directly into consuming Module's contructor so that it can be used during the `onModuleInit` lifecycle hook at application startup.

```typescript
import { DiscoveryModule } from '@nestjs-plus/discovery';
import { Module } from '@nestjs/common';

@Module({
  imports: [DiscoveryModule]
})
export class ExampleModule implements OnModuleInit {
  constructor(private readonly discover: DiscoveryService) {}

  public async onModuleInit() {
    // const providers = await this.discover.providersWithMetaAtKey<number>('metaKey')
  }
}
```

### Discover

The `DiscoveryService` exposes several different querying patterns for your app's components that are [well documented with comments](src/discovery.service.ts). This will also provide intellisense for querying in a TypeScript compatible IDE.

In the case of querying for `providers` or `controllers`, the service returns the following interfaces:

```typescript
export interface DiscoveredModule {
  name: string;
  instance: {};
  injectType?: Type<{}>;
  dependencyType: Type<{}>;
}

export interface DiscoveredClass extends DiscoveredModule {
  parentModule: DiscoveredModule;
}
```

This gives access to the (singleton) `instance` of the matching provider or controller created by the NestJS Dependency Injection container.

The `injectType` can contain the constructor function of the provider token if it is provided as an @Injectable class. In the case of custom providers, this value will either contain the type of the factory function that created the dependency, or undefined if a value was directly provided with `useValue`.

The `dependencyType` is a shortcut to retrieve the constructor function of the actual provided dependency itself. For @Injectable providers/controllers this will simply be the decorated class but for dyanmic providers it will return the constructor function of whatever dependency was actually returned from `useValue` or `useFactory`.

It also provides the string based name for convenience. A `DiscoveredClass` contains a `parentModule` which provides the same set of information for the `@Module` class that the dependency was discovered in.

When querying for methods on `providers` or `controllers` the following interface is returned:

```typescript
export interface DiscoveredMethod {
  handler: (...args: any[]) => any;
  methodName: string;
  parentClass: DiscoveredClass;
}
```

This gives access to the `handler` which is the actual class method implementation as well as the ability to navigate back up the dependency tree with the attached `parentClass`.

When specifically querying for components in the context of looking for decorator metadata, the `...WithMetaAtKey<T>` service methods return the types above along with the metadata that was discovered.

```typescript
export interface DiscoveredMethodWithMeta<T> {
  discoveredMethod: DiscoveredMethod;
  meta: T;
}

export interface DiscoveredClassWithMeta<T> {
  discoveredClass: DiscoveredClass;
  meta: T;
}
```

### Example

Assuming you were using a custom decorator in your application that attached metadata at a key called `exampleKey`:

```typescript
const ExampleDecorator = (meta: string) => SetMetadata('exampleKey', meta);
```

Find all controller methods that have been decorated with `@ExampleDecorator` and retrieve the value they set for meta:

```typescript
const exampleMethodsMeta = await this.discover.controllerMethodsWithMetaAtKey<
  string
>('exampleKey');
```
