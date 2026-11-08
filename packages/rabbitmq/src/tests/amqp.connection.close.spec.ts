import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConsumeMessage } from 'amqplib';
import { AmqpConnection } from '../amqp/connection';

// https://github.com/golevelup/nestjs/issues/1281
describe('AmqpConnection close', () => {
  const createMessage = (n: number) =>
    ({
      content: Buffer.from(JSON.stringify({ n })),
      fields: { deliveryTag: n },
      properties: { headers: {} },
    }) as unknown as ConsumeMessage;

  const deferred = () => {
    let resolve!: () => void;
    const promise = new Promise<void>((res) => (resolve = res));
    return { promise, resolve };
  };

  const createRawChannel = () => {
    const raw = {
      deliver: undefined as unknown as (msg: ConsumeMessage | null) => void,
      consume: vi.fn(async (_queue: string, onMessage: any) => {
        raw.deliver = onMessage;
        return { consumerTag: 'ctag-1' };
      }),
      cancel: vi.fn().mockResolvedValue(undefined),
      ack: vi.fn(),
      nack: vi.fn(),
    };
    return raw;
  };

  let connection: AmqpConnection;
  let logger: { log: any; warn: any; error: any };
  let rawChannel: ReturnType<typeof createRawChannel>;
  let managedChannel: { cancelAll: any; close: any };
  let managedConnection: { close: any };

  beforeEach(() => {
    logger = { log: vi.fn(), warn: vi.fn(), error: vi.fn() };
    connection = new AmqpConnection({
      uri: 'amqp://guest:guest@localhost:5672/',
      logger: logger as any,
    });
    rawChannel = createRawChannel();
    managedChannel = {
      // ChannelWrapper.cancelAll only knows consumers added via ChannelWrapper.consume
      cancelAll: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    };
    managedConnection = { close: vi.fn().mockResolvedValue(undefined) };
    connection['_managedChannels'] = { default: managedChannel as any };
    connection['_managedConnection'] = managedConnection as any;
    vi.spyOn(connection as any, 'setupQueue').mockResolvedValue('test-queue');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const subscribe = (handler: (msg: any) => Promise<any>) =>
    connection['setupSubscriberChannel'](
      handler,
      { queue: 'test-queue' },
      rawChannel as any,
      'handle',
    );

  it('cancels subscribers registered on the raw channel before waiting', async () => {
    await subscribe(async () => undefined);

    await connection.close();

    expect(rawChannel.cancel).toHaveBeenCalledWith('ctag-1');
    expect(rawChannel.cancel.mock.invocationCallOrder[0]).toBeLessThan(
      managedChannel.close.mock.invocationCallOrder[0],
    );
  });

  it('still closes when cancelling a consumer of a closed channel fails', async () => {
    await subscribe(async () => undefined);
    rawChannel.cancel.mockRejectedValue(new Error('Channel closed'));

    await expect(connection.close()).resolves.toBeUndefined();
    expect(managedConnection.close).toHaveBeenCalled();
  });

  it('waits for messages delivered after close() started', async () => {
    const release = new Map([
      [1, deferred()],
      [2, deferred()],
    ]);
    await subscribe(async ({ n }) => release.get(n)!.promise);

    rawChannel.deliver(createMessage(1));
    const closing = connection.close();
    // close() is now waiting for the outstanding messages
    await vi.waitFor(() =>
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Waiting for outstanding consumers'),
      ),
    );

    // Delivered before the broker processed the cancel
    rawChannel.deliver(createMessage(2));
    release.get(1)!.resolve();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(managedChannel.close).not.toHaveBeenCalled();

    release.get(2)!.resolve();
    await closing;

    expect(rawChannel.ack).toHaveBeenCalledTimes(2);
    expect(rawChannel.ack.mock.invocationCallOrder[1]).toBeLessThan(
      managedChannel.close.mock.invocationCallOrder[0],
    );
  });

  it('does not leave an unhandled rejection when the error handler throws', async () => {
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);
    try {
      await subscribe(async () => {
        throw new Error('handler failed');
      });
      rawChannel.nack.mockImplementation(() => {
        throw new Error('Channel closing');
      });

      rawChannel.deliver(createMessage(1));
      await connection.close();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off('unhandledRejection', unhandled);
    }
  });
});
