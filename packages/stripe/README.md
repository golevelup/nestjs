# @golevelup/nestjs-stripe

Interacting with the Stripe API or consuming Stripe webhooks in your NestJS applications is now easy as pie 🥧

<p align="center">
<a href="https://www.npmjs.com/package/@golevelup/nestjs-stripe"><img src="https://img.shields.io/npm/v/@golevelup/nestjs-stripe.svg?style=flat" alt="version" /></a>
<a href="https://www.npmjs.com/package/@golevelup/nestjs-stripe"><img alt="downloads" src="https://img.shields.io/npm/dt/@golevelup/nestjs-stripe.svg?style=flat"></a>
<img alt="license" src="https://img.shields.io/npm/l/@golevelup/nestjs-stripe.svg">
</p>

## Features

- 💉 Injectable Stripe client for interacting with the Stripe API in Controllers and Providers

- 🎉 Optionally exposes an API endpoint from your NestJS application at to be used for webhook event processing from Stripe. Defaults to `/stripe/webhook/` but can be easily configured

- 🔒 Automatically validates that the event payload was actually sent from Stripe using the configured webhook signing secret

- 🕵️ Discovers providers from your application decorated with `StripeWebhookHandler` and routes incoming events to them

- 🧭 Route events to logical services easily simply by providing the Stripe webhook event type

## Getting Started

### Install

#### NPM

- Install the package along with the stripe peer dependency

  `npm install --save @golevelup/nestjs-stripe stripe`

#### YARN

- Install the package using yarn with the stripe peer dependency

  `yarn add @golevelup/nestjs-stripe stripe`

### Import

Import and add `StripeModule` to the `imports` section of the consuming module (most likely `AppModule`). Your Stripe API key is required, and you can optionally include a webhook configuration if you plan on consuming Stripe webhook events inside your app.  
Stripe secrets you can get from your Dashboard’s [Webhooks settings](https://dashboard.stripe.com/webhooks). Select an endpoint that you want to obtain the secret for, then click the Click to reveal button.

`account` - The webhook secret registered in the Stripe Dashboard for events on your accounts  
`connect` - The webhook secret registered in the Stripe Dashboard for events on Connected accounts

```typescript
import { StripeModule } from '@golevelup/nestjs-stripe';

@Module({
  imports: [
    StripeModule.forRoot(StripeModule, {
      apiKey: '123',
      webhookConfig: {
        stripeSecrets: {
          account: 'abc',
          connect: 'cba',
        },
      },
    }),
  ],
})
export class AppModule {
  // ...
}
```

### Configuration

The Stripe Module supports both the `forRoot` and `forRootAsync` patterns for configuration, so you can easily retrieve the necessary config values from a `ConfigService` or other provider.

### Injectable Providers

The module exposes two injectable providers with accompanying decorators for your convenience. These can be provided to the constructors of controllers and other providers:

```typescript
 // injects the instantiated Stripe client which can be used to make API calls
@InjectStripeClient() stripeClient: Stripe
```

```typescript
// injects the module configuration
@InjectStripeModuleConfig() config: StripeModuleConfig
```

## Consuming Webhooks

### Included API Endpoint

This module will automatically add a new API endpoint to your NestJS application for processing webhooks. By default, the route for this endpoint will be `stripe/webhook` but you can modify this to use a different prefix using the `controllerPrefix` property of the `webhookConfig` when importing the module.

### ⚠️ Configure Raw Request Body Handling

If you would like your NestJS application to be able to process incoming webhooks, it is essential that Stripe has access to the raw request payload.

By default, NestJS is configured to use JSON body parsing middleware which will transform the request before it can be validated by the Stripe library. The easiest solution is to also include the `@golevelup/nestjs-webhooks` package and [follow the steps for setting up simple body parsing](https://github.com/golevelup/nestjs/tree/master/packages/webhooks#simple-raw-body-parsing).

Simply provide either `stripe/webhook` or the API route you chose when configuring the module. For example:

```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    applyRawBodyOnlyTo(consumer, {
      method: RequestMethod.ALL,
      path: 'stripe/webhook',
    });
  }
}
```

Failure to give Stripe access to the raw body will result in nasty runtime errors when events are sent to your endpoint

### Decorate Methods For Processing Webhook Events

Exposing provider/service methods to be used for processing Stripe events is easy! Simply use the provided decorator and indicate the event type that the handler should receive.

[Review the Stripe documentation](https://stripe.com/docs/api/events/types) for more information about the types of events available.

```typescript
@Injectable()
class PaymentCreatedService {
  @StripeWebhookHandler('payment_intent.created')
  handlePaymentIntentCreated(evt: StripeEvent) {
    // execute your custom business logic
  }
}
```

### Webhook Controller Decorators

You can also pass any class decorator to the `decorators` property of the `webhookConfig` object as a part of the module configuration. This could be used in situations like when using the `@nestjs/throttler` package and needing to apply the `@SkipThrottle()` decorator, or when you have a global guard but need to skip routes with certain metadata.

```typescript
StripeModule.forRoot(StripeModule, {
  apiKey: '123',
  webhookConfig: {
    stripeWebhookSecret: 'super-secret',
    decorators: [SkipThrottle()],
  },
}),
```

### Usage with Interceptors, Guards and Filters

This library is built using an underlying NestJS concept called `External Contexts` which allows for methods to be included in the NestJS lifecycle. This means that Guards, Interceptors and Filters (collectively known as "enhancers") can be used in conjunction with Stripe webhook handlers. However, this can have unwanted/unintended consequences if you are using _Global_ enhancers in your application as these will also apply to all Stripe webhook handlers. If you were previously expecting all contexts to be regular HTTP contexts, you may need to add conditional logic to prevent your enhancers from applying to Stripe webhook handlers.

You can identify Stripe webhook contexts by their context type, `'stripe_webhook'`:

```typescript
@Injectable()
class ExampleInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const contextType = context.getType<'http' | 'stripe_webhook'>();

    // Do nothing if this is a Stripe webhook event
    if (contextType === 'stripe_webhook') {
      return next.handle();
    }

    // Execute custom interceptor logic for HTTP request/response
    return next.handle();
  }
}
```

### Configure Webhooks in the Stripe Dashboard

Follow the instructions from the [Stripe Documentation](https://stripe.com/docs/webhooks) for remaining integration steps such as testing your integration with the CLI before you go live and properly configuring the endpoint from the Stripe dashboard so that the correct events are sent to your NestJS app.

## Contribute

Contributions welcome! Read the [contribution guidelines](../../CONTRIBUTING.md) first.

## License

[MIT License](../../LICENSE)
