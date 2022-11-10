import Stripe from 'stripe';

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

interface StripeSecrets {
  /**
   * The webhook secret registered in the Stripe Dashboard for events on your accounts
   */
  account?: string;

  /**
   * The webhook secret registered in the Stripe Dashboard for events on Connected accounts
   */
  connect?: string;
}

export interface StripeModuleConfig extends Partial<Stripe.StripeConfig> {
  readonly apiKey: string;
  /**
   * Configuration for processing Stripe Webhooks
   */
  webhookConfig?: {
    stripeSecrets: RequireAtLeastOne<StripeSecrets>;

    /**
     * The property on the request that contains the raw message body so that it
     * can be validated. Defaults to 'body'
     */
    requestBodyProperty?: string;

    /**
     * The prefix of the generated webhook handling controller. Defaults to 'stripe'
     */
    controllerPrefix?: string;

    /**
     * Any metadata specific decorators you want to apply to the webhook handling controller.
     *
     * Note: these decorators must only set metadata that will be read at request time. Decorators like Nest's `@UsePipes()` or `@UseInterceptors()` wll not work, due to the time at which Nest reads the metadata for those, but something  that uses `SetMetadata` will be fine, because that metadata is read at request time.
     */
    decorators?: ClassDecorator[];

    /**
     * Logging configuration
     */
    loggingConfiguration?: {
      /**
       * If enabled will log information regarding event handlers that match incoming webhook events
       */
      logMatchingEventHandlers: boolean;
    };
  };
}

export interface StripeWebhookHandlerConfig {
  /**
   * Event type from Stripe that will be used to match this handler
   */
  eventType: string;
}
