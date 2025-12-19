import { Controller, Headers, Post, Query, Request } from '@nestjs/common';
import { InjectStripeModuleConfig } from './stripe.decorators';
import { StripeModuleConfig, StripeWebhookMode } from './stripe.interfaces';
import { StripePayloadService } from './stripe.payload.service';
import { StripeWebhookService } from './stripe.webhook.service';

@Controller('/stripe')
export class StripeWebhookController {
  private readonly requestBodyProperty: string;

  constructor(
    @InjectStripeModuleConfig()
    config: StripeModuleConfig,
    private readonly stripePayloadService: StripePayloadService,
    private readonly stripeWebhookService: StripeWebhookService,
  ) {
    this.requestBodyProperty =
      config.webhookConfig?.requestBodyProperty || 'body';
  }

  @Post('/webhook')
  async handleWebhook(
    @Headers('stripe-signature') sig: string,
    @Request() request,
    @Query('mode') mode: StripeWebhookMode = StripeWebhookMode.SNAPSHOT,
  ) {
    if (!sig) {
      throw new Error('Missing stripe-signature header');
    }

    if (mode !== 'thin' && mode !== 'snapshot') {
      throw new Error(`Invalid mode ${mode} query parameter`);
    }

    const rawBody = request[this.requestBodyProperty];

    const event = this.stripePayloadService.tryHydratePayload(
      sig,
      rawBody,
      mode,
    );

    await this.stripeWebhookService.handleWebhook(event, mode);
  }
}
