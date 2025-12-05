import { Subscription } from '@google-cloud/pubsub';

import { PubsubTopicContainer } from './pubsub-topic.container';
import { PubsubSubscriptionConfiguration } from './pubsub.client-types';

export class PubsubSubscriptionContainer {
  constructor(
    public readonly instance: Subscription,
    public readonly configuration: PubsubSubscriptionConfiguration,
    public readonly topicContainer: PubsubTopicContainer,
  ) {}
}
