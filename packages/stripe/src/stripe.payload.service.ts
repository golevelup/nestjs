import { Injectable } from '@nestjs/common';
import { Buffer } from 'node:buffer';
import Stripe from 'stripe';
import {
  InjectStripeClient,
  InjectStripeModuleConfig,
} from './stripe.decorators';
import { StripeModuleConfig } from './stripe.interfaces';

@Injectable()
export class StripePayloadService {
  private readonly stripeWebhookSecret: string;
  private readonly stripeConnectWebhookSecret: string;

  constructor(
    @InjectStripeModuleConfig()
    private readonly config: StripeModuleConfig,
    @InjectStripeClient()
    private readonly stripeClient: Stripe
  ) {
    this.stripeWebhookSecret =
      this.config.webhookConfig?.stripeSecrets.account || '';
    this.stripeConnectWebhookSecret =
      this.config.webhookConfig?.stripeSecrets.connect || '';
  }
  tryHydratePayload(signature: string, payload: Buffer): { type: string } {
    const decodedPayload = JSON.parse(
      Buffer.isBuffer(payload) ? payload.toString('utf8') : payload
    );

    return this.stripeClient.webhooks.constructEvent(
      payload,
      signature,
      decodedPayload.account
        ? this.stripeConnectWebhookSecret
        : this.stripeWebhookSecret
    );
  }
}
