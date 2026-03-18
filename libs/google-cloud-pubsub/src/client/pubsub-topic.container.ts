import { Topic } from '@google-cloud/pubsub';

import { PubsubTopicConfiguration } from './pubsub.client-types';
import { PubsubSerializer } from './pubsub.serializer';

export class PubsubTopicContainer {
  constructor(
    public readonly instance: Topic,
    public readonly configuration: PubsubTopicConfiguration,
    public readonly serializer: PubsubSerializer,
  ) {}
}
