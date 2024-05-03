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
  private readonly stripeWebhookTestSecret: string;
  private readonly stripeConnectWebhookSecret: string;
  private readonly stripeConnectWebhookTestSecret: string;

  constructor(
    @InjectStripeModuleConfig()
    private readonly config: StripeModuleConfig,
    @InjectStripeClient()
    private readonly stripeClient: Stripe
  ) {
    this.stripeWebhookSecret =
      this.config.webhookConfig?.stripeSecrets.account || '';
    this.stripeWebhookTestSecret =
      this.config.webhookConfig?.stripeSecrets.accountTest || '';
    this.stripeConnectWebhookSecret =
      this.config.webhookConfig?.stripeSecrets.connect || '';
    this.stripeConnectWebhookTestSecret =
      this.config.webhookConfig?.stripeSecrets.connectTest || '';
  }
  tryHydratePayload(signature: string, payload: Buffer): { type: string } {
    const decodedPayload = JSON.parse(
      Buffer.isBuffer(payload) ? payload.toString('utf8') : payload
    );

    let secretToUse: string;
    if (!decodedPayload.account && decodedPayload.livemode) {
      secretToUse = this.stripeWebhookSecret;
    } else if (!decodedPayload.account && !decodedPayload.livemode) {
      secretToUse = this.stripeWebhookTestSecret;
    } else if (decodedPayload.account && decodedPayload.livemode) {
      secretToUse = this.stripeConnectWebhookSecret;
    } else if (decodedPayload.account && !decodedPayload.livemode) {
      secretToUse = this.stripeConnectWebhookTestSecret;
    } else {
      throw new Error(
        'Could not determine which secret to use for this webhook call!'
      );
    }

    return this.stripeClient.webhooks.constructEvent(
      payload,
      signature,
      secretToUse
    );
  }
}
