import { Subscription } from '@google-cloud/pubsub';
import { PubsubSubscriptionBatchManager } from './pubsub-subscription.batch-manager';

import { PubsubTopicContainer } from './pubsub-topic.container';
import { PubsubSubscriptionConfiguration } from './pubsub.client-types';

export class PubsubSubscriptionContainer {
  public batchManager?: PubsubSubscriptionBatchManager;

  constructor(
    public readonly instance: Subscription,
    public readonly configuration: PubsubSubscriptionConfiguration,
    public readonly topicContainer: PubsubTopicContainer,
  ) {}
}
