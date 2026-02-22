import * as pLimit from 'p-limit';
import { Message } from '@google-cloud/pubsub';

import { PubsubBatchManagerConfigurationInvalidError } from './pubsub-configuration.errors';
import { Deferred, promiseWithResolvers } from './utils';

export interface BatchManagerOptions {
  maxMessages: number;
  concurrency: number;
  maxWaitTimeMilliseconds: number;
}

export class PubsubSubscriptionBatchManager {
  private messageBuffer: Message[] = [];
  private deferredBuffer: Deferred<void>[] = [];

  private queue: { batch: Message[]; deferreds: Deferred<void>[] }[] = [];

  private timer: NodeJS.Timeout | null = null;
  private limiter: pLimit.Limit;

  private listener:
    | ((batch: Message[], deferreds: Deferred<void>[]) => Promise<void>)
    | null = null;

  constructor(private readonly options: BatchManagerOptions) {
    if (!Number.isInteger(options.maxMessages) || options.maxMessages <= 0) {
      throw new PubsubBatchManagerConfigurationInvalidError({
        key: 'subscription.batchManagerOptions.maxMessages',
        value: options.maxMessages,
        reason: 'Must be a positive integer greater than 0.',
      });
    }

    if (
      !Number.isInteger(options.maxWaitTimeMilliseconds) ||
      options.maxWaitTimeMilliseconds <= 0
    ) {
      throw new PubsubBatchManagerConfigurationInvalidError({
        key: 'subscription.batchManagerOptions.maxWaitTimeMilliseconds',
        value: options.maxWaitTimeMilliseconds,
        reason: 'Must be a positive integer greater than 0.',
      });
    }

    if (!Number.isInteger(options.concurrency) || options.concurrency <= 0) {
      throw new PubsubBatchManagerConfigurationInvalidError({
        key: 'subscription.batchManagerOptions.concurrency',
        value: options.concurrency,
        reason: 'Must be a positive integer greater than 0.',
      });
    }

    this.limiter = pLimit(options.concurrency);
  }

  public addListener(
    listener: (batch: Message[], deferreds: Deferred<void>[]) => Promise<void>,
  ) {
    this.listener = listener;
  }

  public setConcurrency(concurrency: number) {
    this.options.concurrency = concurrency;
    this.limiter = pLimit(this.options.concurrency);

    this.processQueue();
  }

  public add(message: Message) {
    const deferred = promiseWithResolvers<void>();

    this.messageBuffer.push(message);
    this.deferredBuffer.push(deferred);

    if (this.messageBuffer.length >= this.options.maxMessages) {
      this.enqueueBuffer();
    } else if (!this.timer) {
      this.timer = setTimeout(() => {
        this.enqueueBuffer();
      }, this.options.maxWaitTimeMilliseconds);
    }

    return deferred.promise;
  }

  private enqueueBuffer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.messageBuffer.length === 0) {
      return;
    }

    this.queue.push({
      batch: this.messageBuffer,
      deferreds: this.deferredBuffer,
    });

    this.messageBuffer = [];
    this.deferredBuffer = [];

    this.processQueue();
  }

  public async flush() {
    this.enqueueBuffer();

    while (this.queue.length > 0 || this.limiter.activeCount > 0) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  private processQueue() {
    while (
      this.queue.length > 0 &&
      this.limiter.activeCount < this.options.concurrency
    ) {
      const item = this.queue.shift()!;

      this.limiter(() => this.listener!(item.batch, item.deferreds)).finally(
        () => this.processQueue(),
      );
    }
  }
}
