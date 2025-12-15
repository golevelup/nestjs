import { Message } from '@google-cloud/pubsub';
import { PubsubSubscriptionBatchManager } from '@golevelup/nestjs-google-cloud-pubsub/src/client/pubsub-subscription.batch-manager';
import { promiseWithResolvers } from '@golevelup/nestjs-google-cloud-pubsub/src/client/utils';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createItem = (id: string) => ({
  message: { id } as unknown as Message,
  deferred: promiseWithResolvers(),
});

describe('PubsubSubscriptionBatchManager', () => {
  jest.setTimeout(30000);

  let manager: PubsubSubscriptionBatchManager;

  beforeEach(() => {
    manager = new PubsubSubscriptionBatchManager({
      maxMessages: 10,
      maxWaitTimeMilliseconds: 50,
    });
  });

  it('timer cleanup: should cancel the timer if batch is flushed by size limit.', async () => {
    let callsCount = 0;

    manager.on(async (batch) => {
      batch.forEach((i) => i.deferred.resolve());
      callsCount++;
    });

    manager.add(createItem('1'));

    await delay(25);

    for (let i = 2; i <= 10; i++) {
      manager.add(createItem(i.toString()));
    }

    expect(callsCount).toBe(1);

    await delay(35);

    expect(callsCount).toBe(1);
  });

  it('big data processing: should process all items without losing data.', async () => {
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
      const item = createItem(i.toString());
      completionPromises.push(item.deferred.promise);
      manager.add(item);
    }

    await Promise.all(completionPromises);

    expect(processedIds.length).toBe(TOTAL_ITEMS);
    expect(processedIds[0]).toBe('0');
    expect(processedIds[TOTAL_ITEMS - 1]).toBe((TOTAL_ITEMS - 1).toString());
  });

  it('concurrency handling: should add items while listener is slow/blocked.', async () => {
    manager.on(async (batch) => {
      await delay(100);
      batch.forEach((item) => item.deferred.resolve());
    });

    const firstBatchItems: Promise<void>[] = [];
    for (let i = 0; i < 10; i++) {
      const item = createItem(`A-${i}`);
      firstBatchItems.push(item.deferred.promise);
      manager.add(item);
    }

    const secondBatchItems: Promise<void>[] = [];
    for (let i = 0; i < 5; i++) {
      const item = createItem(`B-${i}`);
      secondBatchItems.push(item.deferred.promise);
      manager.add(item);
    }

    await Promise.all(firstBatchItems);
    await Promise.all(secondBatchItems);

    expect(true).toBe(true);
  });

  it('concurrent and big data processing: should handle spikes, pauses, and manual flushes.', async () => {
    const batchSizes: number[] = [];

    manager.on(async (batch) => {
      batchSizes.push(batch.length);
      batch.forEach((i) => i.deferred.resolve());
    });

    const allPromises: Promise<void>[] = [];

    for (let i = 0; i < 10; i++) {
      const item = createItem(`p1-${i}`);
      allPromises.push(item.deferred.promise);
      manager.add(item);
    }

    await delay(10);

    const p2Item = createItem('p2-timer');
    allPromises.push(p2Item.deferred.promise);

    manager.add(p2Item);

    await delay(70);

    for (let i = 0; i < 5; i++) {
      const item = createItem(`p3-${i}`);
      allPromises.push(item.deferred.promise);

      manager.add(item);
    }

    await manager.flush();

    await Promise.all(allPromises);

    expect(batchSizes[0]).toBe(10);
    expect(batchSizes[1]).toBe(1);
    expect(batchSizes[2]).toBe(5);
  });
});
