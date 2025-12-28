import { Message } from '@google-cloud/pubsub';
import { PubsubSubscriptionBatchManager } from '@golevelup/nestjs-google-cloud-pubsub/src/client/pubsub-subscription.batch-manager';
import { promiseWithResolvers } from '@golevelup/nestjs-google-cloud-pubsub/src/client/utils';
import { PubsubBatchManagerConfigurationInvalidError } from '@golevelup/nestjs-google-cloud-pubsub/src/client/pubsub-configuration.errors';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createMessage = (id: string) =>
  ({
    id,
    ack: jest.fn(),
    nack: jest.fn(),
    attributes: {},
    data: Buffer.from(JSON.stringify({ id })),
    deliveryAttempt: 1,
    publishTime: new Date(),
  }) as unknown as Message;

describe('PubsubSubscriptionBatchManager', () => {
  jest.setTimeout(30000);

  it(`${PubsubBatchManagerConfigurationInvalidError.name}: in case if batchManagerOptions.maxMessages is missing.`, async () => {
    const expectedError = new PubsubBatchManagerConfigurationInvalidError({
      key: 'subscription.batchManagerOptions.maxMessages',
      value: undefined,
      reason: 'Must be a positive integer greater than 0.',
    });

    expect(
      () =>
        new PubsubSubscriptionBatchManager({
          maxWaitTimeMilliseconds: 1000,
        } as any),
    ).toThrow(expectedError);
  });

  it(`${PubsubBatchManagerConfigurationInvalidError.name}: in case if batchManagerOptions.maxWaitTimeMilliseconds is missing.`, async () => {
    const expectedError = new PubsubBatchManagerConfigurationInvalidError({
      key: 'subscription.batchManagerOptions.maxWaitTimeMilliseconds',
      value: undefined,
      reason: 'Must be a positive integer greater than 0.',
    });

    expect(
      () =>
        new PubsubSubscriptionBatchManager({
          maxMessages: 5,
        } as any),
    ).toThrow(expectedError);
  });

  it('timer cleanup: should cancel the timer if batch is flushed by size limit.', async () => {
    const manager = new PubsubSubscriptionBatchManager({
      maxMessages: 10,
      maxWaitTimeMilliseconds: 50,
    });

    let callsCount = 0;

    manager.on(async (batch) => {
      batch.forEach((i) => i.deferred.resolve());
      callsCount++;
    });

    manager.add(createMessage('1'));

    await delay(25);

    for (let i = 2; i <= 10; i++) {
      manager.add(createMessage(i.toString()));
    }

    expect(callsCount).toBe(1);

    await delay(35);

    expect(callsCount).toBe(1);
  });

  it('big data processing: should process all items without losing data.', async () => {
    const manager = new PubsubSubscriptionBatchManager({
      maxMessages: 10,
      maxWaitTimeMilliseconds: 50,
    });

    const TOTAL_ITEMS = 5000;
    const processedIds: string[] = [];
    const completionPromises: Promise<void>[] = [];

    manager.on(async (batch) => {
      batch.forEach((item) => {
        processedIds.push(item.message.id);

        item.deferred.resolve();
      });
    });

    for (let i = 0; i < TOTAL_ITEMS; i++) {
      const message = createMessage(i.toString());
      const promise = manager.add(message);
      completionPromises.push(promise);
    }

    await Promise.all(completionPromises);

    expect(processedIds.length).toBe(TOTAL_ITEMS);
    expect(processedIds[0]).toBe('0');
    expect(processedIds[TOTAL_ITEMS - 1]).toBe((TOTAL_ITEMS - 1).toString());
  });

  it('concurrency handling: should add items while listener is slow/blocked.', async () => {
    const manager = new PubsubSubscriptionBatchManager({
      maxMessages: 10,
      maxWaitTimeMilliseconds: 50,
    });

    manager.on(async (batch) => {
      await delay(100);

      batch.forEach((item) => item.deferred.resolve());
    });

    const firstBatchItems: Promise<void>[] = [];

    for (let i = 0; i < 10; i++) {
      const message = createMessage(`A-${i}`);
      const promise = manager.add(message);

      firstBatchItems.push(promise);
    }

    const secondBatchItems: Promise<void>[] = [];

    for (let i = 0; i < 5; i++) {
      const message = createMessage(`B-${i}`);
      const promise = manager.add(message);

      secondBatchItems.push(promise);
    }

    await Promise.all(firstBatchItems);
    await Promise.all(secondBatchItems);

    expect(true).toBe(true);
  });

  it('concurrent and big data processing: should handle spikes, pauses, and manual flushes.', async () => {
    const manager = new PubsubSubscriptionBatchManager({
      maxMessages: 10,
      maxWaitTimeMilliseconds: 50,
    });

    const batchSizes: number[] = [];

    manager.on(async (batch) => {
      batchSizes.push(batch.length);

      batch.forEach((i) => i.deferred.resolve());
    });

    const allPromises: Promise<void>[] = [];

    for (let i = 0; i < 10; i++) {
      const message = createMessage(`p1-${i}`);
      const promise = manager.add(message);

      allPromises.push(promise);
    }

    await delay(10);

    const p2Message = createMessage('p2-timer');
    const p2Promise = manager.add(p2Message);

    allPromises.push(p2Promise);

    await delay(70);

    for (let i = 0; i < 5; i++) {
      const message = createMessage(`p3-${i}`);
      const promise = manager.add(message);

      allPromises.push(promise);
    }

    await manager.flush();

    await Promise.all(allPromises);

    expect(batchSizes[0]).toBe(10);
    expect(batchSizes[1]).toBe(1);
    expect(batchSizes[2]).toBe(5);
  });

  it('high throughput: should wait for more messages but flush quickly if time limit reached.', async () => {
    const manager = new PubsubSubscriptionBatchManager({
      maxMessages: 100,
      maxWaitTimeMilliseconds: 20,
    });

    let batchSize = 0;

    const processedPromise = promiseWithResolvers<void>();

    manager.on(async (batch) => {
      batchSize = batch.length;
      batch.forEach((i) => i.deferred.resolve());
      processedPromise.resolve();
    });

    for (let i = 0; i < 50; i++) {
      manager.add(createMessage(i.toString()));
    }

    const start = Date.now();
    await processedPromise.promise;
    const duration = Date.now() - start;

    expect(batchSize).toBe(50);
    expect(duration).toBeGreaterThanOrEqual(15);
  });

  it('low latency: should flush immediately when small size limit is reached.', async () => {
    const manager = new PubsubSubscriptionBatchManager({
      maxMessages: 5,
      maxWaitTimeMilliseconds: 500,
    });

    let batchSize = 0;
    const processedPromise = promiseWithResolvers<void>();

    manager.on(async (batch) => {
      batchSize = batch.length;
      batch.forEach((i) => i.deferred.resolve());
      processedPromise.resolve();
    });

    const start = Date.now();

    for (let i = 0; i < 5; i++) {
      manager.add(createMessage(i.toString()));
    }

    await processedPromise.promise;

    const duration = Date.now() - start;

    expect(batchSize).toBe(5);
    expect(duration).toBeLessThan(100);
  });
});
