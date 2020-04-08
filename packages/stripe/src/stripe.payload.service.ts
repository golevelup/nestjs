import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import {
  InjectStripeClient,
  InjectStripeModuleConfig,
} from './stripe.decorators';
import { StripeModuleConfig } from './stripe.interfaces';

@Injectable()
export class StripePayloadService {
  private readonly stripeWebhookSecret: string;

  constructor(
    @InjectStripeModuleConfig()
    private readonly config: StripeModuleConfig,
    @InjectStripeClient()
    private readonly stripeClient: Stripe
  ) {
    this.stripeWebhookSecret =
      this.config.webhookConfig?.stripeWebhookSecret || '';
  }
  tryHydratePayload(signature: string, payload: Buffer): { type: string } {
    return this.stripeClient.webhooks.constructEvent(
      payload,
      signature,
      this.stripeWebhookSecret
    );
  }
}
