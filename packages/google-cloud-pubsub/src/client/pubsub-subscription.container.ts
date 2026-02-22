import { Subscription } from '@google-cloud/pubsub';
import { PubsubSubscriptionBatchManager } from './pubsub-subscription.batch-manager';
import { PubsubTopicContainer } from './pubsub-topic.container';
import { PubsubSubscriptionConfiguration } from './pubsub.client-types';
import { ResourceState } from './resource-manager';

export class PubsubSubscriptionContainer {
  constructor(
    public readonly instance: Subscription,
    public readonly configuration: PubsubSubscriptionConfiguration,
    public readonly topicContainer: PubsubTopicContainer,
    public readonly batchManager?: {
      instance: PubsubSubscriptionBatchManager;
      concurrencyPerResourceStateMap: { [K in ResourceState]: number };
    },
  ) {}
}
