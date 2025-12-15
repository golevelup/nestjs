import { PubSub, Subscription } from '@google-cloud/pubsub';
import * as crypto from 'crypto';

import {
  PubsubConfigurationInvalidError,
  PubsubConfigurationMismatchError,
} from '../../../packages/google-cloud-pubsub/src/client/pubsub-configuration.errors';
import { PubsubClient, PubsubTopicConfiguration } from '../../../packages/google-cloud-pubsub/src/client';
import { assertRejectsWith } from './pubsub-client.spec-utils';

// These tests are skipped. They require a real Google Cloud Pub/Sub instance.
// To run these tests locally:
// 1. Remove '.skip' from the describe() block.
// 2. Export the GOOGLE_APPLICATION_CREDENTIALS environment variable.
describe.skip('PubsubClient.connectAndValidateSubscription()', () => {
  jest.setTimeout(45000);

  let pubsub: PubSub;
  let pubsubClient: PubsubClient;

  beforeEach(() => {
    pubsub = new PubSub({});

    pubsubClient = new PubsubClient({});
  });

  afterEach(async () => {
    await pubsub.close();
  });

  it(`${PubsubConfigurationInvalidError.name}: in case of duplicate subscription name.`, async () => {
    const topicConfiguration = {
      name: `topic.${crypto.randomUUID()}`,
      subscriptions: [{ name: `subscription.${crypto.randomUUID()}` }],
    } as const satisfies PubsubTopicConfiguration;

    const subscriptionConfiguration = topicConfiguration.subscriptions[0];

    const [topic] = await pubsub.createTopic(topicConfiguration.name);

    await topic.createSubscription(subscriptionConfiguration.name);

    const topicContainer = await pubsubClient['connectAndValidateTopic'](topicConfiguration);

    await pubsubClient['connectAndValidateSubscription'](topicContainer, subscriptionConfiguration);

    await assertRejectsWith(
      () => pubsubClient['connectAndValidateSubscription'](topicContainer, subscriptionConfiguration),
      PubsubConfigurationInvalidError,
      (error) => {
        expect(error.invalidEntry).toEqual({
          key: 'subscription.name',
          reason: 'Duplicate subscription name.',
          value: subscriptionConfiguration.name,
        } satisfies PubsubConfigurationInvalidError['invalidEntry']);
      },
    );
  });

  it(`${PubsubConfigurationMismatchError.name}: in case if subscription is not linked to the right topic.`, async () => {
    const topicConfiguration = {
      name: `topic.${crypto.randomUUID()}`,
      subscriptions: [{ name: `subscription.${crypto.randomUUID()}` }],
    } as const satisfies PubsubTopicConfiguration;

    await pubsub.createTopic(topicConfiguration.name);

    const subscriptionConfiguration = topicConfiguration.subscriptions[0];

    const anotherTopicConfiguration = {
      name: `topic.${crypto.randomUUID()}`,
      subscriptions: [],
    };

    const [anotherTopic] = await pubsub.createTopic(anotherTopicConfiguration.name);

    await anotherTopic.createSubscription(subscriptionConfiguration.name);

    const topicContainer = await pubsubClient['connectAndValidateTopic'](topicConfiguration);

    await assertRejectsWith(
      () => pubsubClient['connectAndValidateSubscription'](topicContainer, subscriptionConfiguration),
      PubsubConfigurationMismatchError,
      (error) => {
        expect(error.mismatchEntry).toEqual({
          key: 'subscription.topic.name',
          local: topicContainer.configuration.name,
          remote: anotherTopicConfiguration.name,
        } satisfies PubsubConfigurationMismatchError['mismatchEntry']);
      },
    );
  });

  it(`${PubsubConfigurationMismatchError.name}: in case the subscription doesn't exist in remote configuration.`, async () => {
    const topicConfiguration = {
      name: `topic.${crypto.randomUUID()}`,
      subscriptions: [{ name: `subscription.${crypto.randomUUID()}` }],
    } as const satisfies PubsubTopicConfiguration;

    await pubsub.createTopic(topicConfiguration.name);

    const subscriptionConfiguration = topicConfiguration.subscriptions[0];

    const topicContainer = await pubsubClient['connectAndValidateTopic'](topicConfiguration);

    await assertRejectsWith(
      () => pubsubClient['connectAndValidateSubscription'](topicContainer, subscriptionConfiguration),
      PubsubConfigurationMismatchError,
      (error) => {
        expect(error.mismatchEntry).toEqual({
          key: 'subscription.name',
          local: subscriptionConfiguration.name,
          remote: null,
        } satisfies PubsubConfigurationMismatchError['mismatchEntry']);
      },
    );
  });

  it(`Successfully connect subscription.`, async () => {
    const topicConfiguration = {
      name: `topic.${crypto.randomUUID()}`,
      subscriptions: [{ name: `subscription.${crypto.randomUUID()}` }],
    } as const satisfies PubsubTopicConfiguration;

    const subscriptionConfiguration = topicConfiguration.subscriptions[0];

    const [topic] = await pubsub.createTopic(topicConfiguration.name);

    await topic.createSubscription(subscriptionConfiguration.name);

    const topicContainer = await pubsubClient['connectAndValidateTopic'](topicConfiguration);

    await pubsubClient['connectAndValidateSubscription'](topicContainer, subscriptionConfiguration);

    const subscriptionContainer = pubsubClient['subscriptionContainers'].get(subscriptionConfiguration.name);

    expect(subscriptionContainer!.configuration).toEqual(subscriptionConfiguration);
    expect(subscriptionContainer!.instance).toBeInstanceOf(Subscription);
    expect(subscriptionContainer!.topicContainer.configuration).toEqual(topicContainer.configuration);
  });
});
