import { Encodings, PubSub, SchemaTypes } from '@google-cloud/pubsub';
import { schema } from 'avsc';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import {
  GoogleCloudPubsubMessage,
  PubsubClient,
  PubsubTopicConfiguration,
} from '../client';

import { Level3ProtocolBuffer } from './proto/level3';
import { assertRejectsWith } from './util';

const avroSchema3 = {
  fields: [
    { name: 'field1', type: 'string' },
    { name: 'field2', type: 'int' },
    { name: 'field3', type: 'boolean' },
    { name: 'field4', type: 'double' },
    {
      name: 'field5',
      type: {
        fields: [{ name: 'nestedField1', type: 'string' }],
        name: 'Nested1',
        type: 'record',
      },
    },
  ],
  name: 'Level3',
  type: 'record',
} satisfies schema.RecordType;

// These tests are skipped. They require a real Google Cloud Pub/Sub instance.
// To run these tests locally:
// 1. Remove '.skip' from the describe() block.
// 2. Export the GOOGLE_APPLICATION_CREDENTIALS environment variable.
describe.skip('PubsubClient.attachHandler()', () => {
  jest.setTimeout(45000);

  let pubsub: PubSub;

  beforeAll(async () => {
    pubsub = new PubSub({});
  });

  afterAll(async () => {
    await pubsub.close();
  });

  it('should throw an error if the subscription container is not registered.', async () => {
    const pubsubClient = new PubsubClient({});
    const unregisteredSubscription = `unregistered-sub-${crypto.randomUUID()}`;

    await pubsubClient.initialize([]);

    await assertRejectsWith(
      () =>
        pubsubClient.attachHandler(unregisteredSubscription, async () => {}),
      Error,
      (error) => {
        expect(error.message).toBe(
          `Subscription (${unregisteredSubscription}) is not registered.`,
        );
      },
    );

    await pubsubClient.close();
  });

  it('Default JSON: should correctly receive and deserialize.', async () => {
    const topicConfiguration = {
      name: `topic-${crypto.randomUUID()}`,
      subscriptions: [{ name: `subscription-${crypto.randomUUID()}` }],
    } as const satisfies PubsubTopicConfiguration;

    const subscriptionName = topicConfiguration.subscriptions[0].name;

    await pubsub.createTopic(topicConfiguration.name);
    await pubsub
      .topic(topicConfiguration.name)
      .createSubscription(subscriptionName);

    const pubsubClient = new PubsubClient({});

    await pubsubClient.initialize([topicConfiguration]);

    try {
      const testData = { message: 'hello world', value: 12345 };
      let receivedData: any = null;

      const messageReceivedPromise = new Promise<void>(
        async (resolve, reject) => {
          try {
            await pubsubClient.attachHandler(
              subscriptionName,
              async (message: GoogleCloudPubsubMessage) => {
                try {
                  receivedData = message.data;
                  resolve();
                } catch (processingError) {
                  reject(processingError);
                }
              },
            );
          } catch (attachError) {
            reject(attachError);
          }
        },
      );

      await pubsubClient.publish(topicConfiguration.name, { data: testData });

      await expect(messageReceivedPromise).resolves.toBeUndefined();

      expect(receivedData).toEqual(testData);
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Binary} encoding: should correctly receive and deserialize.`, async () => {
    const topicConfiguration = {
      name: `topic-${crypto.randomUUID()}`,
      schema: {
        definition: avroSchema3,
        encoding: Encodings.Binary,
        name: `schema-${crypto.randomUUID()}`,
        type: SchemaTypes.Avro,
      },
      subscriptions: [{ name: `subscription-${crypto.randomUUID()}` }],
    } as const satisfies PubsubTopicConfiguration;

    const subscriptionName = topicConfiguration.subscriptions[0].name;

    const definition = JSON.stringify(topicConfiguration.schema.definition);
    const remoteSchema = await pubsub.createSchema(
      topicConfiguration.schema.name,
      topicConfiguration.schema.type,
      definition,
    );

    await pubsub.createTopic({
      name: topicConfiguration.name,
      schemaSettings: {
        encoding: topicConfiguration.schema.encoding,
        schema: await remoteSchema.getName(),
      },
    });
    await pubsub
      .topic(topicConfiguration.name)
      .createSubscription(subscriptionName);

    const pubsubClient = new PubsubClient({});

    await pubsubClient.initialize([topicConfiguration]);

    try {
      const testData = {
        field1: 'l3-bin',
        field2: 456,
        field3: false,
        field4: 3.14,
        field5: { nestedField1: 'nested-bin' },
      };
      let receivedData: any = null;

      const messageReceivedPromise = new Promise<void>(
        async (resolve, reject) => {
          try {
            await pubsubClient.attachHandler(
              subscriptionName,
              async (message: GoogleCloudPubsubMessage) => {
                try {
                  receivedData = message.data;
                  resolve();
                } catch (processingError) {
                  reject(processingError);
                }
              },
            );
          } catch (attachError) {
            reject(attachError);
          }
        },
      );

      await pubsubClient.publish(topicConfiguration.name, { data: testData });

      await expect(messageReceivedPromise).resolves.toBeUndefined();

      expect(receivedData).toEqual(testData);
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Json} encoding: should correctly receive and deserialize.`, async () => {
    const topicConfiguration = {
      name: `topic-${crypto.randomUUID()}`,
      schema: {
        definition: avroSchema3,
        encoding: Encodings.Json,
        name: `schema-${crypto.randomUUID()}`,
        type: SchemaTypes.Avro,
      },
      subscriptions: [{ name: `subscription-${crypto.randomUUID()}` }],
    } as const satisfies PubsubTopicConfiguration;

    const subscriptionName = topicConfiguration.subscriptions[0].name;

    const definition = JSON.stringify(topicConfiguration.schema.definition);
    const remoteSchema = await pubsub.createSchema(
      topicConfiguration.schema.name,
      topicConfiguration.schema.type,
      definition,
    );

    await pubsub.createTopic({
      name: topicConfiguration.name,
      schemaSettings: {
        encoding: topicConfiguration.schema.encoding,
        schema: await remoteSchema.getName(),
      },
    });
    await pubsub
      .topic(topicConfiguration.name)
      .createSubscription(subscriptionName);

    const pubsubClient = new PubsubClient({});

    await pubsubClient.initialize([topicConfiguration]);

    try {
      const testData = {
        field1: 'l3-json',
        field2: 456,
        field3: false,
        field4: 3.14,
        field5: { nestedField1: 'nested-json' },
      };
      let receivedData: any = null;

      const messageReceivedPromise = new Promise<void>(
        async (resolve, reject) => {
          try {
            await pubsubClient.attachHandler(
              subscriptionName,
              async (message: GoogleCloudPubsubMessage) => {
                try {
                  receivedData = message.data;
                  resolve();
                } catch (processingError) {
                  reject(processingError);
                }
              },
            );
          } catch (attachError) {
            reject(attachError);
          }
        },
      );

      await pubsubClient.publish(topicConfiguration.name, { data: testData });

      await expect(messageReceivedPromise).resolves.toBeUndefined();

      expect(receivedData).toEqual(testData);
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Binary} encoding: should correctly receive and deserialize.`, async () => {
    const protoPath = path.resolve(__dirname, './proto/level3.proto');

    const topicConfiguration = {
      name: `topic-${crypto.randomUUID()}`,
      schema: {
        definition: Level3ProtocolBuffer,
        encoding: Encodings.Binary,
        name: `schema-${crypto.randomUUID()}`,
        protoPath,
        type: SchemaTypes.ProtocolBuffer,
      },
      subscriptions: [{ name: `subscription-${crypto.randomUUID()}` }],
    } as const satisfies PubsubTopicConfiguration;

    const subscriptionName = topicConfiguration.subscriptions[0].name;

    const definition = fs.readFileSync(
      topicConfiguration.schema.protoPath,
      'utf-8',
    );
    const remoteSchema = await pubsub.createSchema(
      topicConfiguration.schema.name,
      topicConfiguration.schema.type,
      definition,
    );

    await pubsub.createTopic({
      name: topicConfiguration.name,
      schemaSettings: {
        encoding: topicConfiguration.schema.encoding,
        schema: await remoteSchema.getName(),
      },
    });
    await pubsub
      .topic(topicConfiguration.name)
      .createSubscription(subscriptionName);

    const pubsubClient = new PubsubClient({});

    await pubsubClient.initialize([topicConfiguration]);

    try {
      const testData = {
        field1: 'l3-bin',
        field2: 456,
        field3: false,
        field4: 3.14,
        field5: { nestedField1: 'nested-bin' },
      };
      let receivedData: any = null;

      const messageReceivedPromise = new Promise<void>(
        async (resolve, reject) => {
          try {
            await pubsubClient.attachHandler(
              subscriptionName,
              async (message: GoogleCloudPubsubMessage) => {
                try {
                  receivedData = message.data;
                  resolve();
                } catch (processingError) {
                  reject(processingError);
                }
              },
            );
          } catch (attachError) {
            reject(attachError);
          }
        },
      );

      await pubsubClient.publish(topicConfiguration.name, { data: testData });

      await expect(messageReceivedPromise).resolves.toBeUndefined();

      expect(receivedData).toEqual(testData);
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Json} encoding: should correctly receive and deserialize.`, async () => {
    const protoPath = path.resolve(__dirname, './proto/level3.proto');

    const topicConfiguration = {
      name: `topic-${crypto.randomUUID()}`,
      schema: {
        definition: Level3ProtocolBuffer,
        encoding: Encodings.Json,
        name: `schema-${crypto.randomUUID()}`,
        protoPath,
        type: SchemaTypes.ProtocolBuffer,
      },
      subscriptions: [{ name: `subscription-${crypto.randomUUID()}` }],
    } as const satisfies PubsubTopicConfiguration;

    const subscriptionName = topicConfiguration.subscriptions[0].name;

    const definition = fs.readFileSync(
      topicConfiguration.schema.protoPath,
      'utf-8',
    );
    const remoteSchema = await pubsub.createSchema(
      topicConfiguration.schema.name,
      topicConfiguration.schema.type,
      definition,
    );

    await pubsub.createTopic({
      name: topicConfiguration.name,
      schemaSettings: {
        encoding: topicConfiguration.schema.encoding,
        schema: await remoteSchema.getName(),
      },
    });
    await pubsub
      .topic(topicConfiguration.name)
      .createSubscription(subscriptionName);

    const pubsubClient = new PubsubClient({});

    await pubsubClient.initialize([topicConfiguration]);

    try {
      const testData = {
        field1: 'l3-json',
        field2: 456,
        field3: false,
        field4: 3.14,
        field5: { nestedField1: 'nested-json' },
      };
      let receivedData: any = null;

      const messageReceivedPromise = new Promise<void>(
        async (resolve, reject) => {
          try {
            await pubsubClient.attachHandler(
              subscriptionName,
              async (message: GoogleCloudPubsubMessage) => {
                try {
                  receivedData = message.data;
                  resolve();
                } catch (processingError) {
                  reject(processingError);
                }
              },
            );
          } catch (attachError) {
            reject(attachError);
          }
        },
      );

      await pubsubClient.publish(topicConfiguration.name, { data: testData });

      await expect(messageReceivedPromise).resolves.toBeUndefined();

      expect(receivedData).toEqual(testData);
    } finally {
      await pubsubClient.close();
    }
  });

  it('should wait for all outstanding messages (2 topics, 2 subs, 6 total msgs) to be processed on close().', async () => {
    const topicConfiguration1 = {
      name: `topic-${crypto.randomUUID()}`,
      subscriptions: [{ name: `subscription-${crypto.randomUUID()}` }],
    } as const satisfies PubsubTopicConfiguration;

    const subscription1Name = topicConfiguration1.subscriptions[0].name;

    const topicConfiguration2 = {
      name: `topic-${crypto.randomUUID()}`,
      subscriptions: [{ name: `subscription-${crypto.randomUUID()}` }],
    } as const satisfies PubsubTopicConfiguration;

    const subscription2Name = topicConfiguration2.subscriptions[0].name;

    await pubsub.createTopic(topicConfiguration1.name);
    await pubsub
      .topic(topicConfiguration1.name)
      .createSubscription(subscription1Name);

    await pubsub.createTopic(topicConfiguration2.name);
    await pubsub
      .topic(topicConfiguration2.name)
      .createSubscription(subscription2Name);

    const pubsubClient = new PubsubClient({});

    await pubsubClient.initialize([topicConfiguration1, topicConfiguration2]);

    const messagesPerTopic = 3;
    const totalHandlersToRun = 6;
    const processingTimes = [2000, 1000, 3500];

    const handlerFinishTimes: number[] = [];
    let handlersStartedCount = 0;

    await pubsubClient.attachHandler(
      subscription1Name,
      async (message: GoogleCloudPubsubMessage<{ id: number }>) => {
        handlersStartedCount++;
        const processingTime = processingTimes[message.data.id];

        await new Promise((res) => setTimeout(res, processingTime));

        handlerFinishTimes.push(Date.now());
      },
    );

    await pubsubClient.attachHandler(
      subscription2Name,
      async (message: GoogleCloudPubsubMessage<{ id: number }>) => {
        handlersStartedCount++;
        const processingTime = processingTimes[message.data.id];

        await new Promise((res) => setTimeout(res, processingTime));

        handlerFinishTimes.push(Date.now());
      },
    );

    const publishPromises1 = Array.from(
      { length: messagesPerTopic },
      (_, i) => {
        return pubsubClient.publish(topicConfiguration1.name, {
          data: { id: i },
        });
      },
    );

    const publishPromises2 = Array.from(
      { length: messagesPerTopic },
      (_, i) => {
        return pubsubClient.publish(topicConfiguration2.name, {
          data: { id: i },
        });
      },
    );

    await Promise.all([...publishPromises1, ...publishPromises2]);

    const pollingPromise = new Promise<void>((resolve, reject) => {
      const startTime = Date.now();
      const timeout = 10000;
      const pollInterval = 10;

      const intervalId = setInterval(() => {
        if (handlersStartedCount === totalHandlersToRun) {
          clearInterval(intervalId);
          resolve();
        }

        if (Date.now() - startTime > timeout) {
          clearInterval(intervalId);
          reject(
            new Error(
              `Timeout: Only ${handlersStartedCount}/${totalHandlersToRun} handlers started.`,
            ),
          );
        }
      }, pollInterval);
    });

    await expect(pollingPromise).resolves.toBeUndefined();

    await pubsubClient.close();
    const closeFinishedTime = Date.now();

    expect(handlerFinishTimes.length).toBe(totalHandlersToRun);

    const lastHandlerFinishTime = Math.max(...handlerFinishTimes);

    expect(closeFinishedTime).toBeGreaterThanOrEqual(lastHandlerFinishTime);
  });
});
