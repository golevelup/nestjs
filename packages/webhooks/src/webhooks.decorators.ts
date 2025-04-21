import { Inject } from '@nestjs/common';
import { WEBHOOK_MODULE_CONFIG_TOKEN } from './webhooks.constants';

/**
 * Injects the final Webhook Config (optional values filled in with defaults) from this module
 */
export const InjectWebhookConfig = () => Inject(WEBHOOK_MODULE_CONFIG_TOKEN);
