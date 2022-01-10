# @golevelup/nestjs-modules

<p align="center">
<a href="https://www.npmjs.com/package/@golevelup/nestjs-modules"><img src="https://img.shields.io/npm/v/@golevelup/nestjs-modules.svg?style=flat" alt="version" /></a>
<a href="https://www.npmjs.com/package/@golevelup/nestjs-modules"><img alt="downloads" src="https://img.shields.io/npm/dt/@golevelup/nestjs-modules.svg?style=flat"></a>
<img alt="license" src="https://img.shields.io/npm/l/@golevelup/nestjs-modules.svg">
</p>

## Description

This module provides a reusable, minimal boilerplate method for creating [dynamic module](https://docs.nestjs.com/fundamentals/dynamic-modules) that can be configured synchronously or asynchronously once and then re-used anywhere.

Along with reusable configured dynamic modules, this module provides a way to reduce the majority of dynamic module boilerplate, allowing you to stop working with creating your own `forRoot/forRootAsync` methods and getting on to developing your top tier application.

If you haven't worked with creating dynamic modules yet, take a look [at this article](https://dev.to/nestjs/advanced-nestjs-how-to-build-completely-dynamic-nestjs-modules-1370) by [John Biundo](https://github.com/johnbiundo) to help get used to the topic.

## Motivation

Every now and again you'll come across a use case where you will want to configure a dynamic module and re-use that configuration elsewhere, without having to re-declare the configuration. The immediate example that comes to mind is a non-global `ConfigModule` or a `DatabaseModule` that implements a core module behind the scenes. In either case, you would want to be able to set up your configuration in your root module (`AppModule`) and import the configured module anywhere else in your application. With creating a re-usable dynamic module, we are essentially achieving the same outcome as using `@Global()` without polluting the module's scope. This is a nice alternative if you want to be a little more verbose in where all of your dependencies are coming from.

In addition to the reusability of the module, this package removes the need to write the same boilerplate over and over again. This saves time, errors, and sanity from the developer to allow a better experience while creating a new application.

## Usage

### Installation

To install, run

```sh
npm install @golevelup/nestjs-modules
```

or

```sh
yarn add @golevelup/nestjs-modules
```

and wait for the installation to finish.

### Dynamic Module Creation

Creating a new dynamic module is now easier than ever, all that is needed is the module's name, the options that are to be provided for the module, and a constant string, symbol, or token that is to be used for providing the options through injection. Following the idea of a non-global `ConfigModule`, you can do something like the following:

```ts
import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { Module } from '@nestjs/common';
import { CONFIG_MODULE_OPTIONS } from './config.constants'; // the constant string/symbol/token
import { ConfigModuleOptions } from './config.options'; // the options to provide to the service
import { ConfigService } from './config.service'; // the service to be provided to the rest of the server

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule extends createConfigurableDynamicRootModule<
  ConfigModule,
  ConfigModuleOptions
>(CONFIG_MODULE_OPTIONS) {}
```

And just like that, you've created a Dynamic module. Now in your root module you can configure it like so:

```ts
@Module({
  imports: [ConfigModule.forRoot(ConfigModule, synchronousConfigModuleOptions)],
})
export class AppModule {}
```

or asynchronously

```ts
@Module({
  imports: [ConfigModule.forRootAsync(ConfigModule, asyncConfigModuleOptions)],
})
export class AppModule {}
```

It is important to note that you **must** provide the name of the module class as the first argument of the `forRoot` and `forRootAsync` methods to make sure the library can configure your dynamic module correctly. This is a Type Safe method and will cause the server to fail to start up if a constructor is not passed in.

### Re-Using Dynamic Modules

For re-using the configured dynamic modules, the module provides a static method called `externallyConfigured` that takes in the module class and a number, the milliseconds to wait for asynchronously configured modules. This number does need to be provided, but can usually be set to `0` unless there are asynchronous calls (http calls to other systems or retrieving data from a database) being made. To use the dynamic module in another module, simply import it with the call to `externallyConfigured` like so:

```ts
@Module({
  imports: [ConfigModule.externallyConfigured(ConfigModule, 0)],
})
export class ConfigModuleDependentModule {}
```

#### One Other Option

if you don't like the idea of calling `externallyConfigured` every time, you can create a `static` property on the Dynamic Module and set it equal to the `externallyConfigured` method. Take the above `ConfigModule` example:

```ts
import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { Module } from '@nestjs/common';
import { CONFIG_MODULE_OPTIONS } from './config.constants'; // the constant string/symbol/token
import { ConfigModuleOptions } from './config.options'; // the options to provide to the service
import { ConfigService } from './config.service'; // the service to be provided to the rest of the server

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule extends createConfigurableDynamicRootModule<
  ConfigModule,
  ConfigModuleOptions
>(CONFIG_MODULE_OPTIONS) {
  static deferred = () => ConfigModule.externallyConfigured(ConfigModule, 0);
}
```

Now it can be used in another module like this:

```ts
@Module({
  imports: [ConfigModule.deferred()],
})
export class ConfigModuleDependentModule {}
```

## Contribute

Contributions welcome! Read the [contribution guidelines](../../CONTRIBUTING.md) first.

## License

[MIT License](../../LICENSE)
