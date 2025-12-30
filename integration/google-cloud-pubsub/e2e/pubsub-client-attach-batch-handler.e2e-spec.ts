import { PubSub } from '@google-cloud/pubsub';
import * as crypto from 'crypto';

import {
  PubsubClient,
  PubsubTopicConfiguration,
} from '@golevelup/nestjs-google-cloud-pubsub/src/client';

// These tests are skipped. They require a real Google Cloud Pub/Sub instance.
// To run these tests locally:
// 1. Remove '.skip' from the describe() block.
// 2. Export the GOOGLE_APPLICATION_CREDENTIALS environment variable.
describe.skip('PubsubClient.attachBatchHandler()', () => {
  jest.setTimeout(60000);

  let pubsub: PubSub;

  beforeAll(async () => {
    pubsub = new PubSub({});
  });

  afterAll(async () => {
    await pubsub.close();
  });

  it('flush by size: should flush batch immediately when configured maxMessages limit is reached.', async () => {
    const topicName = `topic-${crypto.randomUUID()}`;
    const subscriptionName = `subscription-${crypto.randomUUID()}`;

    const topicConfiguration = {
      name: topicName,
      subscriptions: [
        {
          name: subscriptionName,
          batchManagerOptions: {
            maxMessages: 5,
            maxWaitTimeMilliseconds: 10000,
          },
        },
      ],
    } as const satisfies PubsubTopicConfiguration;

    await pubsub.createTopic(topicName);
    await pubsub.topic(topicName).createSubscription(subscriptionName);

    const pubsubClient = new PubsubClient({});

    await pubsubClient.initialize([topicConfiguration]);

    let processedMessagesCount = 0;

    const firstBatchProcessedPromise = new Promise<void>((resolve) => {
      pubsubClient.attachBatchHandler(subscriptionName, async (messages) => {
        processedMessagesCount += messages.length;
        if (processedMessagesCount === 5) {
          resolve();
        }
      });
    });

    const startTime = Date.now();

    await Promise.all([
      pubsubClient.publish(topicName, { data: Buffer.from('1') }),
      pubsubClient.publish(topicName, { data: Buffer.from('2') }),
      pubsubClient.publish(topicName, { data: Buffer.from('3') }),
      pubsubClient.publish(topicName, { data: Buffer.from('4') }),
      pubsubClient.publish(topicName, { data: Buffer.from('5') }),
    ]);

    await firstBatchProcessedPromise;

    const endTime = Date.now();

    expect(processedMessagesCount).toBe(5);
    expect(endTime - startTime).toBeLessThan(5000);

    await pubsubClient.publish(topicName, { data: Buffer.from('6') });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    expect(processedMessagesCount).toBe(5);

    await pubsubClient.close();
  });

  it('flush by timer: should flush quickly when maxMessages limit is not reached.', async () => {
    const topicName = `topic-${crypto.randomUUID()}`;
    const subscriptionName = `subscription-${crypto.randomUUID()}`;

    const topicConfiguration = {
      name: topicName,
      subscriptions: [
        {
          name: subscriptionName,
          batchManagerOptions: {
            maxMessages: 100,
            maxWaitTimeMilliseconds: 1000,
          },
        },
      ],
    } as const satisfies PubsubTopicConfiguration;

    await pubsub.createTopic(topicName);
    await pubsub.topic(topicName).createSubscription(subscriptionName);

    const pubsubClient = new PubsubClient({});
    await pubsubClient.initialize([topicConfiguration]);

    let processedMessagesCount = 0;

    const batchProcessedPromise = new Promise<void>((resolve) => {
      pubsubClient.attachBatchHandler(subscriptionName, async (messages) => {
        processedMessagesCount += messages.length;
        if (processedMessagesCount >= 2) {
          resolve();
        }
      });
    });

    await new Promise((r) => setTimeout(r, 2000));

    const startTime = Date.now();

    await pubsubClient.publish(topicName, { data: Buffer.from('A') });
    await pubsubClient.publish(topicName, { data: Buffer.from('B') });

    await batchProcessedPromise;

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(processedMessagesCount).toBe(2);

    expect(duration).toBeGreaterThanOrEqual(1000);
    expect(duration).toBeLessThan(4000);

    await pubsubClient.close();
  });

  it('graceful shutdown: should ensure data integrity on close.', async () => {
    const topicName = `topic-${crypto.randomUUID()}`;
    const subscriptionName = `subscription-${crypto.randomUUID()}`;

    const topicConfiguration = {
      name: topicName,
      subscriptions: [
        {
          name: subscriptionName,
          batchManagerOptions: {
            maxMessages: 100,
            maxWaitTimeMilliseconds: 5000,
          },
        },
      ],
    } as const satisfies PubsubTopicConfiguration;

    await pubsub.createTopic(topicName);
    await pubsub.topic(topicName).createSubscription(subscriptionName);

    const pubsubClient = new PubsubClient({});

    await pubsubClient.initialize([topicConfiguration]);

    let messagesProcessed = false;

    await pubsubClient.attachBatchHandler(subscriptionName, async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));

      messagesProcessed = true;
    });

    await pubsubClient.publish(topicName, {
      data: Buffer.from('shutdown-test'),
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const closeStartTime = Date.now();

    await pubsubClient.close();

    const closeEndTime = Date.now();

    expect(messagesProcessed).toBe(true);
    expect(closeEndTime - closeStartTime).toBeLessThan(3000);
  });
});
