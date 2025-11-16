import { MessageOptions } from '@google-cloud/pubsub/build/src/topic';
import { Inject } from '@nestjs/common';

import { PubsubClient } from './client';
import { GOOGLE_CLOUD_PUBSUB_CLIENT_TOKEN } from './google-cloud-pubsub.constants';

export abstract class AbstractGoogleCloudPubsubPublisher<
  PayloadMap extends Record<string, unknown>,
> {
  constructor(
    @Inject(GOOGLE_CLOUD_PUBSUB_CLIENT_TOKEN)
    private readonly pubsubClient: PubsubClient,
  ) {}

  public async publish<TopicName extends keyof PayloadMap & string>(
    topicName: TopicName,
    message: Omit<MessageOptions, 'data' | 'json'> & {
      data: PayloadMap[TopicName];
    },
  ) {
    return this.pubsubClient.publish(topicName, message);
  }
}
