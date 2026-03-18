import * as crypto from 'crypto';

import { PubsubTopicConfiguration } from '../src';
import { PubsubConfigurationInvalidError } from '../src/client/pubsub-configuration.errors';
import { PubsubClient } from '../src/client/pubsub.client';

import { assertRejectsWith } from './pubsub-client.spec-utils';

describe.skip('PubsubClient.initialize()', () => {
  jest.setTimeout(30000);

  it(`${PubsubConfigurationInvalidError.name}: in case of duplicate topic name.`, async () => {
    const pubsubClient = new PubsubClient({});

    const topicName = `topic.${crypto.randomUUID()}`;

    const topicConfiguration: PubsubTopicConfiguration = {
      name: topicName,
      subscriptions: [],
    };

    await assertRejectsWith(
      () => pubsubClient.initialize([topicConfiguration, topicConfiguration]),
      PubsubConfigurationInvalidError,
      (error) => {
        expect(error.invalidEntry).toEqual({
          key: 'name',
          reason: 'Duplicate topic name in configuration.',
          value: topicName,
        } satisfies PubsubConfigurationInvalidError['invalidEntry']);
      },
    );
  });

  it(`${PubsubConfigurationInvalidError.name}: in case of duplicate subscription name.`, async () => {
    const pubsubClient = new PubsubClient({});

    const topicName = `topic.${crypto.randomUUID()}`;
    const subscriptionName = `subscription.${crypto.randomUUID()}`;

    const topicConfiguration = {
      name: topicName,
      subscriptions: [{ name: subscriptionName }, { name: subscriptionName }],
    } as const satisfies PubsubTopicConfiguration;

    await assertRejectsWith(
      () => pubsubClient.initialize([topicConfiguration]),
      PubsubConfigurationInvalidError,
      (error) => {
        expect(error.invalidEntry).toEqual({
          key: 'subscription.name',
          reason: 'Duplicate subscription name in configuration.',
          value: subscriptionName,
        } satisfies PubsubConfigurationInvalidError['invalidEntry']);
      },
    );
  });
});
