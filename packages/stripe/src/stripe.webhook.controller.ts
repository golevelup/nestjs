import { Controller, Headers, Post, Request } from '@nestjs/common';
import { InjectStripeModuleConfig } from './stripe.decorators';
import { StripeModuleConfig } from './stripe.interfaces';
import { StripePayloadService } from './stripe.payload.service';
import { StripeWebhookService } from './stripe.webhook.service';

@Controller('/stripe')
export class StripeWebhookController {
  private readonly requestBodyProperty: string;

  constructor(
    @InjectStripeModuleConfig()
    private readonly config: StripeModuleConfig,
    private readonly stripePayloadService: StripePayloadService,
    private readonly stripeWebhookService: StripeWebhookService
  ) {
    this.requestBodyProperty =
      config.webhookConfig?.requestBodyProperty || 'body';
  }

  @Post('/webhook')
  async handleWebhook(
    @Headers('stripe-signature') sig: string,
    @Request() request
  ) {
    if (!sig) {
      throw new Error('Missing stripe-signature header');
    }
    const rawBody = request[this.requestBodyProperty];

    const event = this.stripePayloadService.tryHydratePayload(sig, rawBody);

    await this.stripeWebhookService.handleWebhook(event);
  }
}
