import { Injectable, SetMetadata } from '@nestjs/common';
import { STRIPE_WEBHOOK_SERVICE } from './stripe.constants';

@Injectable()
@SetMetadata(STRIPE_WEBHOOK_SERVICE, true)
export class StripeWebhookService {
  public handleWebhook(evt: any): any {
    // The implementation for this method is overriden by the containing module
    console.log(evt);
  }
}
