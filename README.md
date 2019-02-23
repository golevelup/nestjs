<p align="center">
    <image src="nestpluslogo.svg">
</p>

<p align="center">
A collection of badass modules and utilities to help you level up your NestJS application. 
</p>

<p align="center">
    <a href="https://travis-ci.org/nestjs/nest"><img src="https://travis-ci.org/WonderPanda/nestjs-plus.svg?branch=master" alt="Travis" /></a>
</p>

## Packages

The various packages are managed using Yarn Workspaces and Lerna and published under the `@nestjs-plus` organization on NPM.

#### [Common - @nestjs-plus/common](packages/common/README.md)

- Mixin Utilities
- `DiscoveryModule` for finding providers and handlers from your app that have certain metadata

#### [RabbitMQ - @nestjs-plus/rabbitmq](packages/rabbitmq/README.md)

- A NestJS native module for RabbitMQ that supports both RPC and PubSub messaging patterns


## Incubating (Potential future packages)

#### [Caching - @nestjs-plus/caching](packages/caching/README.md)

- A flexible module for response caching that allows per route/handler cache configuration

#### Cloud specific packages (@nestjs-plus/azure)
