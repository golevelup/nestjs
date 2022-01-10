# @golevelup/nestjs-common

<p align="center">
<a href="https://www.npmjs.com/package/@golevelup/nestjs-common"><img src="https://img.shields.io/npm/v/@golevelup/nestjs-common.svg?style=flat" alt="version" /></a>
<a href="https://www.npmjs.com/package/@golevelup/nestjs-common"><img alt="downloads" src="https://img.shields.io/npm/dt/@golevelup/nestjs-common.svg?style=flat"></a>
<img alt="license" src="https://img.shields.io/npm/l/@golevelup/nestjs-common.svg">
</p>

Utility functions and low level reusable modules that provide building blocks for the @levelup-nestjs and @nestjs ecosystem.

## Inject Decorator Factory (makeInjectableDecorator)

Creates a decorator that can be used as a convenience to inject a specific token

Instead of using `@Inject(SOME_THING_TOKEN)` this can be used to create a new named Decorator such as `@InjectSomeThing()` which will hide the token details from users making APIs easier
to consume

## Mixins

The mixin pattern is particularly useful with NestJS components like `Interceptors` as a mechanism to provide both configuration while still allowing the component to participate with Nest's `Dependency Injection`.

## Contribute

Contributions welcome! Read the [contribution guidelines](../../CONTRIBUTING.md) first.

## License

[MIT License](../../LICENSE)
