import { Injectable, SetMetadata } from '@nestjs/common';
import { STRIPE_WEBHOOK_SERVICE } from './stripe.constants';
import { StripeWebhookMode } from './stripe.interfaces';

@Injectable()
@SetMetadata(STRIPE_WEBHOOK_SERVICE, true)
export class StripeWebhookService {
  public handleWebhook(
    event: any,
    mode: StripeWebhookMode,
  ): void | Promise<void> {
    // The implementation for this method is overridden by the containing module
    console.log(event, mode);
  }
}
