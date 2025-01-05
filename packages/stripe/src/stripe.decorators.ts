import { Inject, SetMetadata } from '@nestjs/common';
import Stripe from 'stripe';
import { MODULE_OPTIONS_TOKEN } from './stripe-module-definition';
import {
  STRIPE_CLIENT_TOKEN,
  STRIPE_WEBHOOK_HANDLER,
} from './stripe.constants';

/**
 * Injects the Stripe Module config
 */
export const InjectStripeModuleConfig = () => Inject(MODULE_OPTIONS_TOKEN);

/**
 * Injects the Stripe Client instance
 */
export const InjectStripeClient = () => Inject(STRIPE_CLIENT_TOKEN);

/**
 * Binds the decorated service method as a handler for incoming Stripe Webhook events.
 * Events will be automatically routed here based on their event type property
 * @param config The configuration for this handler
 */
export const StripeWebhookHandler = (
  eventType: Stripe.WebhookEndpointCreateParams.EnabledEvent,
) => SetMetadata(STRIPE_WEBHOOK_HANDLER, eventType);
