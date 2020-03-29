import { makeInjectableDecorator } from '@golevelup/nestjs-common';
import {
  WEBHOOK_MODULE_CONFIG_TOKEN,
  WEBHOOK_MODULE_PROVIDED_CONFIG_TOKEN,
} from './webhooks.contants';

/**
 * Injects the Webhook Config provided to this module (may have optional values)
 */
export const InjectProvidedWebhookConfig = makeInjectableDecorator(
  WEBHOOK_MODULE_PROVIDED_CONFIG_TOKEN
);

/**
 * Injects the final Webhook Config (optional values filled in with defaults) from this module
 */
export const InjectWebhookConfig = makeInjectableDecorator(
  WEBHOOK_MODULE_CONFIG_TOKEN
);
