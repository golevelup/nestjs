import { Message } from '@google-cloud/pubsub';
import { promiseWithResolvers } from './utils';

type BatchItem = {
  message: Message;
  deferred: ReturnType<typeof promiseWithResolvers<void>>;
};

export class PubsubSubscriptionBatchManager {
  private buffer: BatchItem[] = [];
  private timer: NodeJS.Timeout | null = null;

  private listener: ((batch: BatchItem[]) => Promise<void>) | null = null;

  constructor(
    private readonly options: {
      maxMessages: number;
      maxWaitTimeMilliseconds: number;
    },
  ) {}

  public on(handler: (batch: BatchItem[]) => Promise<void>) {
    this.listener = handler;
  }

  public add(item: BatchItem) {
    this.buffer.push(item);

    if (this.buffer.length >= this.options.maxMessages) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => {
        void this.flush();
      }, this.options.maxWaitTimeMilliseconds);
    }
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
