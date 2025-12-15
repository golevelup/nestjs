import { PubSub } from '@google-cloud/pubsub';
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
describe.skip('PubsubClient.connectAndValidateTopic()', () => {
  jest.setTimeout(45000);

  let pubsub: PubSub;

  beforeAll(async () => {
    pubsub = new PubSub({});
  });

  afterAll(async () => {
    await pubsub.close();
  });

  it(`${PubsubConfigurationInvalidError.name}: in case of duplicate topic name.`, async () => {
    const pubsubClient = new PubsubClient({});

    const topicConfiguration: PubsubTopicConfiguration = {
      name: `topic.${crypto.randomUUID()}`,
      subscriptions: [],
    };

    await pubsub.createTopic(topicConfiguration.name);

    await pubsubClient['connectAndValidateTopic']({
      name: topicConfiguration.name,
      subscriptions: [],
    });

    await assertRejectsWith(
      () =>
        pubsubClient['connectAndValidateTopic']({
          name: topicConfiguration.name,
          subscriptions: [],
        }),
      PubsubConfigurationInvalidError,
      (error) => {
        expect(error.invalidEntry).toEqual({
          key: 'name',
          reason: 'Duplicate topic name.',
          value: topicConfiguration.name,
        } satisfies PubsubConfigurationInvalidError['invalidEntry']);
      },
    );
  });

  it(`${PubsubConfigurationMismatchError.name}: in case if local topic doesn't exists in remote configuration.`, async () => {
    const pubsubClient = new PubsubClient({});

    const topicConfiguration: PubsubTopicConfiguration = {
      name: `topic.${crypto.randomUUID()}`,
      subscriptions: [],
    };

    await assertRejectsWith(
      () =>
        pubsubClient['connectAndValidateTopic']({
          name: topicConfiguration.name,
          subscriptions: [],
        }),
      PubsubConfigurationMismatchError,
      (error) => {
        expect(error.mismatchEntry).toEqual({
          key: 'name',
          local: topicConfiguration.name,
          remote: null,
        } satisfies PubsubConfigurationMismatchError['mismatchEntry']);
      },
    );
  });

  it(`Successfully connect topic.`, async () => {
    const pubsubClient = new PubsubClient({});

    const topicConfiguration: PubsubTopicConfiguration = {
      name: `topic.${crypto.randomUUID()}`,
      subscriptions: [],
    };

    await pubsub.createTopic(topicConfiguration.name);

    const topicContainer = await pubsubClient['connectAndValidateTopic']({
      name: topicConfiguration.name,
      subscriptions: [],
    });

    expect(topicContainer.configuration).toEqual(topicConfiguration);
  });
});
