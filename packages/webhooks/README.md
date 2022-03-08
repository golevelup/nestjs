# @golevelup/nestjs-webhooks

<p align="center">
<a href="https://www.npmjs.com/package/@golevelup/nestjs-webhooks"><img src="https://img.shields.io/npm/v/@golevelup/nestjs-webhooks.svg?style=flat" alt="version" /></a>
<a href="https://www.npmjs.com/package/@golevelup/nestjs-webhooks"><img alt="downloads" src="https://img.shields.io/npm/dt/@golevelup/nestjs-webhooks.svg?style=flat"></a>
<img alt="license" src="https://img.shields.io/npm/l/@golevelup/nestjs-webhooks.svg">
</p>

## Motivation

Make it easier to build NestJS applications that consume webhooks from third party services

## Features

- ✅ Simple utilities and middleware for enabling a request's raw body to be unmodified on specified routes
- ✅ Control raw body parsing so that you can copy the raw body onto a new configurable property on the Request object
- ✅ Provide a reusable foundation for building more specific webhook integrations

### Install

`npm install ---save @golevelup/nestjs-webhooks`

or

`yarn add @golevelup/nestjs-webhooks`

## Techniques

### Simple Raw Body Parsing

Many third party webhook providing services require that the raw body be available on the request in order for it to be validated. However, a NestJS app in it's default state automatically includes JSON parsing middleware which will modify the req.body property.

The most basic use case is keeping JSON parsing on all routes except for the ones you specifically want to exclude such that the request body property remains unchanged.

#### Step 1: Disable global raw body parsing

In your bootstrap function (normally in `main.ts`), disable body parsing. Don't worry! We'll bring it back to the other routes later.

```typescript
const app = await NestFactory.create(AppModule, {
  bodyParser: false,
});
```

#### Step 2: Configure Middleware Routes

If your AppModule doesn't already, implement the `NestModule` interface from `@nestjs/common`. This will allow you to [apply middleware to specific routes](https://docs.nestjs.com/middleware#applying-middleware).

We provide a utility function to simplify configuration using the already imported middlewares. This will automatically configure your app to apply raw body parsing to the routes you specify and then to automatically apply JSON body parsing to all other routes with the exclusion of the raw routes.

```typescript
import { applyRawBodyOnlyTo } from '@golevelup/nestjs-webhooks';

class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    applyRawBodyOnlyTo(consumer, {
      method: RequestMethod.ALL,
      path: 'webhook',
    });
  }
}
```

## Contribute

Contributions welcome! Read the [contribution guidelines](../../CONTRIBUTING.md) first.

## License

[MIT License](../../LICENSE)
