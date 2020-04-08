import { makeInjectableDecorator } from '@golevelup/nestjs-common';
import { SetMetadata } from '@nestjs/common';
import {
  STRIPE_CLIENT_TOKEN,
  STRIPE_MODULE_CONFIG_TOKEN,
  STRIPE_WEBHOOK_HANDLER,
} from './stripe.constants';

/**
 * Injects the Stripe Module config
 */
export const InjectStripeModuleConfig = makeInjectableDecorator(
  STRIPE_MODULE_CONFIG_TOKEN
);

/**
 * Injects the Stripe Client instance
 */
export const InjectStripeClient = makeInjectableDecorator(STRIPE_CLIENT_TOKEN);

/**
 * Binds the decorated service method as a handler for incoming Stripe Webhook events.
 * Events will be automatically routed here based on their event type property
 * @param config The configuration for this handler
 */
export const StripeWebhookHandler = (eventType: string) =>
  SetMetadata(STRIPE_WEBHOOK_HANDLER, eventType);
