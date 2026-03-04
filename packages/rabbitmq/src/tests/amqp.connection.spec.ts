import { AmqpConnection } from '../amqp/connection';

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
    jest.clearAllMocks();
    jest
      .spyOn(AmqpConnection.prototype as any, 'selectManagedChannel')
      .mockReturnValue({
        addSetup: jest.fn((callback) => callback(mockChannel)),
      });
    jest
      .spyOn(AmqpConnection.prototype as any, 'setupSubscriberChannel')
      .mockReturnValue(mockConsumerTag);
    jest
      .spyOn(AmqpConnection.prototype as any, 'setupRpcChannel')
      .mockReturnValue(mockConsumerTag);
    jest
      .spyOn(AmqpConnection.prototype as any, 'setupQueue')
      .mockResolvedValue('test-queue');

    connection = new AmqpConnection(mockConfig);
  });

  it('should return consumer tag when resolves', async () => {
    const mockHandler = jest.fn();
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
    const mockHandler = jest.fn();
    const mockRpcOptions = { queueOptions: { channel: mockChannel } };

    const result = await connection.createRpc(mockHandler, mockRpcOptions);

    expect(result).toEqual({ consumerTag: mockConsumerTag });
  });

  it('should inherit consumer tag from global config', async () => {
    const mockHandler = jest.fn();
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
    const mockHandler = jest.fn();
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
    const mockHandler = jest.fn();
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
    const mockHandler = jest.fn();
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
    const mockHandler = jest.fn();
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
});
