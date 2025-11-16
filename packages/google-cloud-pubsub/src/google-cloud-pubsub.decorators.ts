import { SetMetadata } from '@nestjs/common';

import {
  GoogleCloudPubsubMessage,
  InferPayloadMap,
  PubsubTopicConfiguration,
} from './client';
import { GOOGLE_CLOUD_PUBSUB_SUBSCRIBE } from './google-cloud-pubsub.constants';

export interface PubsubSubscribeMetadata {
  subscription: string;
  topic: string;
}

export function createSubscribeDecorator<
  Topics extends readonly PubsubTopicConfiguration[],
>() {
  type PayloadMap = InferPayloadMap<Topics>;

  type SubscriptionNamePerTopicName<TopicName extends keyof PayloadMap> =
    Extract<
      Topics[number],
      { name: TopicName }
    >['subscriptions'][number]['name'];

  return <TopicName extends keyof PayloadMap>(
    topic: TopicName,
    subscription: SubscriptionNamePerTopicName<TopicName>,
  ) => {
    return (
      target: object,
      key: string | symbol,
      descriptor: TypedPropertyDescriptor<
        (
          payload: GoogleCloudPubsubMessage<PayloadMap[TopicName]>,
        ) => Promise<void>
      >,
    ) => {
      SetMetadata(GOOGLE_CLOUD_PUBSUB_SUBSCRIBE, {
        subscription,
        topic,
      } as PubsubSubscribeMetadata)(target, key, descriptor);

      return descriptor;
    };
  };
}
