import pLimit from 'p-limit';
import { Message } from '@google-cloud/pubsub';

import { PubsubBatchManagerConfigurationInvalidError } from './pubsub-configuration.errors';
import { Deferred, promiseWithResolvers } from './utils';

export interface BatchManagerOptions {
  maxMessages: number;
  maxWaitTimeMilliseconds: number;
}

export class PubsubSubscriptionBatchManager {
  private messageBuffer: Message[] = [];
  private deferredBuffer: Deferred<void>[] = [];

  private queue: { batch: Message[]; deferreds: Deferred<void>[] }[] = [];

  private timer: NodeJS.Timeout | null = null;
  private readonly limiter = pLimit(10);

  private readonly listener: (
    batch: Message[],
    deferreds: Deferred<void>[],
  ) => Promise<void>;
  private readonly options: BatchManagerOptions;

  constructor(
    options: BatchManagerOptions | undefined,
    listener: (batch: Message[], deferreds: Deferred<void>[]) => Promise<void>,
  ) {
    const maxMessages = options?.maxMessages;

    if (!Number.isInteger(maxMessages) || maxMessages! <= 0) {
      throw new PubsubBatchManagerConfigurationInvalidError({
        key: 'subscription.batchManagerOptions.maxMessages',
        value: maxMessages,
        reason: 'Must be a positive integer greater than 0.',
      });
    }

    const maxWaitTimeMilliseconds = options?.maxWaitTimeMilliseconds;

    if (
      !Number.isInteger(maxWaitTimeMilliseconds) ||
      maxWaitTimeMilliseconds! <= 0
    ) {
      throw new PubsubBatchManagerConfigurationInvalidError({
        key: 'subscription.batchManagerOptions.maxWaitTimeMilliseconds',
        value: maxWaitTimeMilliseconds,
        reason: 'Must be a positive integer greater than 0.',
      });
    }

    this.options = options!;
    this.listener = listener;
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

  private async processQueue() {
    while (this.queue.length > 0 && this.limiter.pendingCount === 0) {
      const item = this.queue.shift();

      if (!item) {
        break;
      }

      this.limiter(() => this.listener(item.batch, item.deferreds)).finally(
        () => this.processQueue(),
      );
    }
  }
}
