import { PubSub } from '@google-cloud/pubsub';
import * as crypto from 'crypto';

import { PubsubClient, PubsubTopicConfiguration } from '@golevelup/nestjs-google-cloud-pubsub/src/client';

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

  it('flush by size: should flush batch immediately when maxMessages limit is reached', async () => {
    const topicName = `topic-${crypto.randomUUID()}`;
    const subscriptionName = `subscription-${crypto.randomUUID()}`;

    const topicConfiguration = {
      name: topicName,
      subscriptions: [
        {
          name: subscriptionName,
          options: {
            flowControl: { maxMessages: 5 },
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
    expect(endTime - startTime).toBeLessThan(3000);

    await pubsubClient.publish(topicName, { data: Buffer.from('6') });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    expect(processedMessagesCount).toBe(6);

    await pubsubClient.close();
  });

  it('flush by timer: should flush quickly (debounce) when maxMessages limit is not reached', async () => {
    const topicName = `topic-${crypto.randomUUID()}`;
    const subscriptionName = `subscription-${crypto.randomUUID()}`;

    const topicConfiguration = {
      name: topicName,
      subscriptions: [
        {
          name: subscriptionName,
          options: {
            flowControl: { maxMessages: 100 },
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

    expect(duration).toBeLessThan(4000);

    await pubsubClient.close();
  });

  it('graceful shutdown: should ensure data integrity on close', async () => {
    const topicName = `topic-${crypto.randomUUID()}`;
    const subscriptionName = `subscription-${crypto.randomUUID()}`;

    const topicConfiguration = {
      name: topicName,
      subscriptions: [
        {
          name: subscriptionName,
          options: {
            flowControl: { maxMessages: 100 },
          },
        },
      ],
    } as const satisfies PubsubTopicConfiguration;

    await pubsub.createTopic(topicName);
    await pubsub.topic(topicName).createSubscription(subscriptionName);

    const pubsubClient = new PubsubClient({});

    await pubsubClient.initialize([topicConfiguration]);

    let areMessagesProcessed = false;

    await pubsubClient.attachBatchHandler(subscriptionName, async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));

      areMessagesProcessed = true;
    });

    await pubsubClient.publish(topicName, { data: Buffer.from('shutdown-test') });

    await new Promise((resolve) => setTimeout(resolve, 4000));

    const closeStartTime = Date.now();

    await pubsubClient.close();

    const closeEndTime = Date.now();

    expect(areMessagesProcessed).toBe(true);
    expect(closeEndTime - closeStartTime).toBeLessThan(3000);
  });

  it('heavy load shutdown: should process all messages that reached memory', async () => {
    const topicName = `topic-${crypto.randomUUID()}`;
    const subscriptionName = `subscription-${crypto.randomUUID()}`;

    const topicConfiguration = {
      name: topicName,
      subscriptions: [
        {
          name: subscriptionName,
          options: {
            flowControl: { maxMessages: 50 },
          },
        },
      ],
    } as const satisfies PubsubTopicConfiguration;

    await pubsub.createTopic(topicName);
    await pubsub.topic(topicName).createSubscription(subscriptionName);

    const pubsubClient = new PubsubClient({});

    await pubsubClient.initialize([topicConfiguration]);

    const totalMessages = 100;
    const processedIds = new Set<string>();

    await pubsubClient.attachBatchHandler(subscriptionName, async (messages) => {
      await new Promise((resolve) => setTimeout(resolve, 20 + Math.random() * 10));

      messages.forEach((msg) => processedIds.add(msg.data.toString()));
    });

    const publishPromises: Promise<any>[] = [];
    for (let i = 0; i < totalMessages; i++) {
      publishPromises.push(pubsubClient.publish(topicName, { data: Buffer.from(i.toString()) }));
    }
    await Promise.all(publishPromises);

    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (processedIds.size > 0) {
          clearInterval(interval);
          resolve();
        }
      }, 30);
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const closeStartTime = Date.now();

    await pubsubClient.close();

    const closeEndTime = Date.now();

    expect(processedIds.size).toBe(totalMessages);

    for (let i = 0; i < totalMessages; i++) {
      if (!processedIds.has(i.toString())) {
        throw new Error(`Message id ${i} lost!`);
      }
    }

    expect(closeEndTime - closeStartTime).toBeLessThan(5000);
  });
});
