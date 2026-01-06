import { Message } from '@google-cloud/pubsub';
import { PubsubBatchManagerConfigurationInvalidError } from './pubsub-configuration.errors';
import { promiseWithResolvers } from './utils';

type BatchItem = {
  message: Message;
  deferred: ReturnType<typeof promiseWithResolvers<void>>;
};

export interface BatchManagerOptions {
  maxMessages: number;
  maxWaitTimeMilliseconds: number;
}

export class PubsubSubscriptionBatchManager {
  private buffer: BatchItem[] = [];
  private timer: NodeJS.Timeout | null = null;

  private listener: ((batch: BatchItem[]) => Promise<void>) | null = null;

  constructor(private readonly options?: BatchManagerOptions) {
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
  }

  public on(handler: (batch: BatchItem[]) => Promise<void>) {
    this.listener = handler;
  }

  public add(message: Message) {
    const deferred = promiseWithResolvers<void>();

    this.buffer.push({ deferred, message });

    if (this.buffer.length >= this.options!.maxMessages) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => {
        void this.flush();
      }, this.options!.maxWaitTimeMilliseconds);
    }

    return deferred.promise;
  }

  public async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.buffer.length === 0) {
      return;
    }

    const batch = this.buffer;
    this.buffer = [];

    if (this.listener) {
      await this.listener(batch);
    }
  }
}
