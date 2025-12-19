import { Injectable } from '@nestjs/common';
import { Buffer } from 'node:buffer';
import Stripe from 'stripe';
import {
  InjectStripeClient,
  InjectStripeModuleConfig,
} from './stripe.decorators';
import {
  StripeModuleConfig,
  StripeSecrets,
  StripeWebhookMode,
} from './stripe.interfaces';

@Injectable()
export class StripePayloadService {
  private readonly stripeSecrets: StripeSecrets;
  private readonly stripeThinSecrets: StripeSecrets;

  constructor(
    @InjectStripeModuleConfig()
    readonly config: StripeModuleConfig,
    @InjectStripeClient()
    private readonly stripeClient: Stripe,
  ) {
    this.stripeSecrets = config.webhookConfig?.stripeSecrets || {};
    this.stripeThinSecrets = config.webhookConfig?.stripeThinSecrets || {};
  }

  tryHydratePayload(
    signature: string,
    payload: Buffer,
    mode: StripeWebhookMode,
  ): { type: string } {
    const decodedPayload = JSON.parse(
      Buffer.isBuffer(payload) ? payload.toString('utf8') : payload,
    );

    const secrets = this.getWebhookSecrets(mode);
    const secretToUse = this.getWebhookSecret(decodedPayload, secrets);

    switch (mode) {
      case StripeWebhookMode.SNAPSHOT:
        return this.stripeClient.webhooks.constructEvent(
          payload,
          signature,
          secretToUse,
        );

      case StripeWebhookMode.THIN:
        return this.stripeClient.parseEventNotification(
          payload,
          signature,
          secretToUse,
        );
    }
  }

  private getWebhookSecrets(mode: StripeWebhookMode) {
    switch (mode) {
      case StripeWebhookMode.SNAPSHOT:
        return this.stripeSecrets;
      case StripeWebhookMode.THIN:
        return this.stripeThinSecrets;
    }
  }

  private getWebhookSecret(
    evt: Stripe.EventBase,
    secrets: StripeSecrets,
  ): string {
    let secret: string | undefined;

    if (!evt.account) {
      secret = evt.livemode ? secrets.account : secrets.accountTest;
    } else {
      secret = evt.livemode ? secrets.connect : secrets.connectTest;
    }

    if (!secret) {
      throw new Error(
        'Could not determine which secret to use for this webhook call!',
      );
    }

    return secret;
  }
}
