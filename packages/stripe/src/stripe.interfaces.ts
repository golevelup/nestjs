import Stripe from 'stripe';

export interface StripeModuleConfig extends Partial<Stripe.StripeConfig> {
  readonly apiKey: string;
  /**
   * Configuration for processing Stripe Webhooks
   */
  webhookConfig?: {
    /**
     * The webhook secret registered in the Stripe Dashboard
     */
    stripeWebhookSecret: string;

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
