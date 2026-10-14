import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AmqpConnection } from '../amqp/connection';
import { ChannelWrapper } from 'amqp-connection-manager';

const mockConsumerTag = 'amq.ctag-mock';

const mockChannel = 'mockChannel';
const mockConfig = {
  hostname: 'localhost',
  port: 5672,
  username: 'guest',
  password: 'guest',
  vhost: '/',
  uri: 'amqp://guest:guest@localhost:5672/',
  queues: [
    {
      name: 'queue_1',
      consumerTag: 'consumer_tag_1',
    },
  ],
};

describe('AmqpConnection', () => {
  let connection: AmqpConnection;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(
      AmqpConnection.prototype as any,
      'selectManagedChannel',
    ).mockReturnValue({
      addSetup: vi.fn((callback) => callback(mockChannel)),
    });
    vi.spyOn(
      AmqpConnection.prototype as any,
      'setupSubscriberChannel',
    ).mockReturnValue(mockConsumerTag);
    vi.spyOn(
      AmqpConnection.prototype as any,
      'setupRpcChannel',
    ).mockReturnValue(mockConsumerTag);
    vi.spyOn(AmqpConnection.prototype as any, 'setupQueue').mockResolvedValue(
      'test-queue',
    );

    connection = new AmqpConnection(mockConfig);
  });

  it('should return consumer tag when resolves', async () => {
    const mockHandler = vi.fn();
    const mockMsgOptions = { queueOptions: { channel: mockChannel } };
    const mockHandlerName = 'mockHandlerName';
    const mockConsumeOptions = {};

    const result = await connection.createSubscriber(
      mockHandler,
      mockMsgOptions,
      mockHandlerName,
      mockConsumeOptions,
    );

    expect(result).toEqual({ consumerTag: mockConsumerTag });
  });

  it('should return consumer tag when resolves', async () => {
    const mockHandler = vi.fn();
    const mockRpcOptions = { queueOptions: { channel: mockChannel } };

    const result = await connection.createRpc(mockHandler, mockRpcOptions);

    expect(result).toEqual({ consumerTag: mockConsumerTag });
  });

  it('should inherit consumer tag from global config', async () => {
    const mockHandler = vi.fn();
    const mockRpcOptions = {
      queue: 'queue_1',
    };

    await connection.createRpc(mockHandler, mockRpcOptions);

    expect(connection.setupRpcChannel).toHaveBeenCalledWith(
      mockHandler,
      {
        queue: 'queue_1',
        queueOptions: {
          consumerOptions: {
            consumerTag: 'consumer_tag_1',
          },
        },
      },
      mockChannel,
    );
  });

  it('should use locally defined consumer tag', async () => {
    const mockHandler = vi.fn();
    const mockRpcOptions = {
      queue: 'queue_1',
      queueOptions: {
        consumerOptions: {
          consumerTag: 'consumer_tag_local',
        },
      },
    };

    await connection.createRpc(mockHandler, mockRpcOptions);

    expect(connection.setupRpcChannel).toHaveBeenCalledWith(
      mockHandler,
      {
        queue: 'queue_1',
        queueOptions: {
          consumerOptions: {
            consumerTag: 'consumer_tag_local',
          },
        },
      },
      mockChannel,
    );
  });

  it('should throw when shared queue handlers use different exchanges', async () => {
    const mockHandler = vi.fn();
    await connection.createRpc(mockHandler, {
      queue: 'test-queue',
      exchange: 'exchange-a',
      routingKey: 'key1',
    });
    await expect(
      connection.createRpc(mockHandler, {
        queue: 'test-queue',
        exchange: 'exchange-b',
        routingKey: 'key2',
      }),
    ).rejects.toThrow(/exchange.*does not match/);
  });

  it('should throw when shared queue handlers use different consumerOptions', async () => {
    const mockHandler = vi.fn();
    await connection.createRpc(mockHandler, {
      queue: 'test-queue',
      exchange: 'exchange1',
      routingKey: 'key1',
      queueOptions: { consumerOptions: { priority: 1 } },
    });
    await expect(
      connection.createRpc(mockHandler, {
        queue: 'test-queue',
        exchange: 'exchange1',
        routingKey: 'key2',
        queueOptions: { consumerOptions: { priority: 5 } },
      }),
    ).rejects.toThrow(/consumerOptions do not match/);
  });

  it('should only call setupRpcChannel once for shared queue', async () => {
    const mockHandler = vi.fn();
    await connection.createRpc(mockHandler, {
      queue: 'shared-queue',
      exchange: 'exchange1',
      routingKey: 'key1',
    });
    await connection.createRpc(mockHandler, {
      queue: 'shared-queue',
      exchange: 'exchange1',
      routingKey: 'key2',
    });

    expect(connection['setupRpcChannel']).toHaveBeenCalledTimes(1);
  });

  describe('publish with defaultPublishOptions', () => {
    const mockPublish = vi.fn().mockResolvedValue(true);

    beforeEach(() => {
      // _managedChannel is private; bracket notation is used to inject the mock in tests
      connection['_managedChannel'] = {
        publish: mockPublish,
      } as unknown as ChannelWrapper;
    });

    it('should publish without options when no defaultPublishOptions are set', async () => {
      await connection.publish('test-exchange', 'test-key', { msg: 'hello' });

      expect(mockPublish).toHaveBeenCalledWith(
        'test-exchange',
        'test-key',
        expect.any(Buffer),
        {},
      );
    });

    it('should apply defaultPublishOptions when publishing', async () => {
      const connectionWithDefaults = new AmqpConnection({
        ...mockConfig,
        defaultPublishOptions: { persistent: true },
      });
      // _managedChannel is private; bracket notation is used to inject the mock in tests
      connectionWithDefaults['_managedChannel'] = {
        publish: mockPublish,
      } as unknown as ChannelWrapper;

      await connectionWithDefaults.publish('test-exchange', 'test-key', {
        msg: 'hello',
      });

      expect(mockPublish).toHaveBeenCalledWith(
        'test-exchange',
        'test-key',
        expect.any(Buffer),
        { persistent: true },
      );
    });

    it('should allow per-call options to override defaultPublishOptions', async () => {
      const connectionWithDefaults = new AmqpConnection({
        ...mockConfig,
        defaultPublishOptions: { persistent: true },
      });
      // _managedChannel is private; bracket notation is used to inject the mock in tests
      connectionWithDefaults['_managedChannel'] = {
        publish: mockPublish,
      } as unknown as ChannelWrapper;

      await connectionWithDefaults.publish(
        'test-exchange',
        'test-key',
        { msg: 'hello' },
        { persistent: false },
      );

      expect(mockPublish).toHaveBeenCalledWith(
        'test-exchange',
        'test-key',
        expect.any(Buffer),
        { persistent: false },
      );
    });

    it('should merge per-call options with defaultPublishOptions', async () => {
      const connectionWithDefaults = new AmqpConnection({
        ...mockConfig,
        defaultPublishOptions: { persistent: true, priority: 1 },
      });
      // _managedChannel is private; bracket notation is used to inject the mock in tests
      connectionWithDefaults['_managedChannel'] = {
        publish: mockPublish,
      } as unknown as ChannelWrapper;

      await connectionWithDefaults.publish(
        'test-exchange',
        'test-key',
        { msg: 'hello' },
        { expiration: '5000' },
      );

      expect(mockPublish).toHaveBeenCalledWith(
        'test-exchange',
        'test-key',
        expect.any(Buffer),
        { persistent: true, priority: 1, expiration: '5000' },
      );
    });
  });

  // https://github.com/golevelup/nestjs/issues/1275
  describe('channel setup', () => {
    const exchanges = [
      { name: 'orders', type: 'topic' },
      { name: 'audit', createExchangeIfNotExists: false },
    ];

    const createMockChannel = () => ({
      prefetch: vi.fn().mockResolvedValue(undefined),
      assertExchange: vi.fn().mockResolvedValue(undefined),
      checkExchange: vi.fn().mockResolvedValue(undefined),
      bindExchange: vi.fn().mockResolvedValue(undefined),
    });

    it('should assert the configured exchanges on a named channel', async () => {
      const connectionWithExchanges = new AmqpConnection({
        ...mockConfig,
        exchanges,
      });
      const channel = createMockChannel();

      // setupInitChannel is private; bracket notation is used to call it in tests
      await connectionWithExchanges['setupInitChannel'](
        channel as any,
        'named',
        { prefetchCount: 1 },
      );

      expect(channel.prefetch).toHaveBeenCalledWith(1);
      expect(channel.assertExchange).toHaveBeenCalledTimes(1);
      expect(channel.assertExchange).toHaveBeenCalledWith(
        'orders',
        'topic',
        undefined,
      );
      // Exchanges that must not be created are left to the default channel.
      expect(channel.checkExchange).not.toHaveBeenCalled();
    });

    it('should assert exchanges on a named channel before resolving its setup', async () => {
      const connectionWithExchanges = new AmqpConnection({
        ...mockConfig,
        exchanges: [{ name: 'orders', type: 'topic' }],
      });
      const channel = createMockChannel();
      let asserted = false;
      channel.assertExchange.mockImplementation(async () => {
        await Promise.resolve();
        asserted = true;
      });

      await connectionWithExchanges['setupInitChannel'](
        channel as any,
        'named',
        { prefetchCount: 1 },
      );

      expect(asserted).toBe(true);
    });
  });
});
