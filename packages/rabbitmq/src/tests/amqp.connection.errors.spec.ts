import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AmqpConnection } from '../amqp/connection';
import {
  RpcTimeoutError,
  ChannelNotAvailableError,
  ConnectionNotAvailableError,
} from '../amqp/errors';
import { ConsumeMessage } from 'amqplib';

describe('Custom RabbitMQ Errors', () => {
  describe(ChannelNotAvailableError.name, () => {
    it('should throw ChannelNotAvailableError when accessing channel before initialization', () => {
      const mockConfig = {
        uri: 'amqp://guest:guest@localhost:5672/',
      };

      const connection = new AmqpConnection(mockConfig);

      expect(() => connection.channel).toThrow(ChannelNotAvailableError);
    });

    it('should throw ChannelNotAvailableError with correct properties', () => {
      const mockConfig = {
        uri: 'amqp://guest:guest@localhost:5672/',
      };

      const connection = new AmqpConnection(mockConfig);

      try {
        void connection.channel;
      } catch (error) {
        expect(error).toBeInstanceOf(ChannelNotAvailableError);
        expect(error).toBeInstanceOf(Error);
        if (error instanceof ChannelNotAvailableError) {
          expect(error.name).toBe('ChannelNotAvailableError');
          expect(error.message).toBe('channel is not available');
        }
      }
    });
  });

  describe(ConnectionNotAvailableError.name, () => {
    it('should throw ConnectionNotAvailableError when accessing connection before initialization', () => {
      const mockConfig = {
        uri: 'amqp://guest:guest@localhost:5672/',
      };

      const connection = new AmqpConnection(mockConfig);

      expect(() => connection.connection).toThrow(ConnectionNotAvailableError);
    });

    it('should throw ConnectionNotAvailableError with correct properties', () => {
      const mockConfig = {
        uri: 'amqp://guest:guest@localhost:5672/',
      };

      const connection = new AmqpConnection(mockConfig);

      try {
        void connection.connection;
      } catch (error) {
        expect(error).toBeInstanceOf(ConnectionNotAvailableError);
        expect(error).toBeInstanceOf(Error);
        if (error instanceof ConnectionNotAvailableError) {
          expect(error.name).toBe('ConnectionNotAvailableError');
          expect(error.message).toBe('connection is not available');
        }
      }
    });
  });

  describe('Error handling patterns', () => {
    it('should allow catching ChannelNotAvailableError specifically', () => {
      const mockConfig = {
        uri: 'amqp://guest:guest@localhost:5672/',
      };

      const connection = new AmqpConnection(mockConfig);
      let errorType: string | undefined;

      try {
        void connection.channel;
      } catch (error) {
        if (error instanceof ChannelNotAvailableError) {
          errorType = 'channel';
        } else if (error instanceof ConnectionNotAvailableError) {
          errorType = 'connection';
        } else {
          errorType = 'unknown';
        }
      }

      expect(errorType).toBe('channel');
    });

    it('should allow catching ConnectionNotAvailableError specifically', () => {
      const mockConfig = {
        uri: 'amqp://guest:guest@localhost:5672/',
      };

      const connection = new AmqpConnection(mockConfig);
      let errorType: string | undefined;

      try {
        void connection.connection;
      } catch (error) {
        if (error instanceof ChannelNotAvailableError) {
          errorType = 'channel';
        } else if (error instanceof ConnectionNotAvailableError) {
          errorType = 'connection';
        } else {
          errorType = 'unknown';
        }
      }

      expect(errorType).toBe('connection');
    });
  });

  describe(RpcTimeoutError.name, () => {
    it('should create error with correct properties', () => {
      const timeout = 3000;
      const exchange = 'my-exchange';
      const routingKey = 'my.routing.key';

      const error = new RpcTimeoutError(timeout, exchange, routingKey);

      expect(error).toBeInstanceOf(RpcTimeoutError);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('RpcTimeoutError');
      expect(error.timeout).toBe(timeout);
      expect(error.exchange).toBe(exchange);
      expect(error.routingKey).toBe(routingKey);
      expect(error.message).toBe(
        `Failed to receive response within timeout of ${timeout}ms for exchange "${exchange}" and routing key "${routingKey}"`,
      );
    });
  });
});

function buildMockMessage(content: Buffer): ConsumeMessage {
  return {
    content,
    fields: {
      routingKey: 'test.routing.key',
      deliveryTag: 1,
      redelivered: false,
      exchange: 'test-exchange',
      consumerTag: 'test-consumer',
    },
    properties: {
      headers: {},
      contentType: undefined,
      contentEncoding: undefined,
      deliveryMode: undefined,
      priority: undefined,
      correlationId: undefined,
      replyTo: undefined,
      expiration: undefined,
      messageId: undefined,
      timestamp: undefined,
      type: undefined,
      userId: undefined,
      appId: undefined,
      clusterId: undefined,
    },
  } as unknown as ConsumeMessage;
}

describe('Error logging in message handlers', () => {
  let connection: AmqpConnection;
  let mockLoggerError: ReturnType<typeof vi.fn>;
  let mockChannel: {
    consume: ReturnType<typeof vi.fn>;
    ack: ReturnType<typeof vi.fn>;
    nack: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoggerError = vi.fn();
    mockChannel = {
      consume: vi.fn().mockResolvedValue({ consumerTag: 'test-consumer-tag' }),
      ack: vi.fn(),
      nack: vi.fn(),
    };
    connection = new AmqpConnection({
      uri: 'amqp://guest:guest@localhost:5672/',
      logger: {
        log: vi.fn(),
        error: mockLoggerError,
        warn: vi.fn(),
        debug: vi.fn(),
        verbose: vi.fn(),
      },
    });
    vi.spyOn(connection as any, 'setupQueue').mockResolvedValue('test-queue');
    vi.spyOn(connection as any, 'registerConsumerForQueue').mockReturnValue(
      undefined,
    );
  });

  async function waitForOutstandingProcessing(
    conn: AmqpConnection,
  ): Promise<void> {
    const set: Set<Promise<void>> = (conn as any).outstandingMessageProcessing;
    // Poll until the set is empty (all message processing promises resolved)
    while (set.size > 0) {
      await Promise.allSettled(set);
    }
  }

  describe('setupSubscriberChannel', () => {
    it('should log error when the handler throws', async () => {
      const handlerError = new Error('handler failed');
      const throwingHandler = vi.fn().mockRejectedValue(handlerError);

      await (connection as any).setupSubscriberChannel(
        throwingHandler,
        {},
        mockChannel,
        'myTestHandler',
      );

      const wrappedConsumer = mockChannel.consume.mock.calls[0][1];
      const msg = buildMockMessage(Buffer.from(JSON.stringify({ key: 'val' })));

      wrappedConsumer(msg);
      await waitForOutstandingProcessing(connection);

      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.stringContaining('myTestHandler'),
        expect.any(String),
      );
      expect(mockChannel.nack).toHaveBeenCalled();
    });

    it('should log error when message contains malformed JSON', async () => {
      const handler = vi.fn();

      await (connection as any).setupSubscriberChannel(
        handler,
        {},
        mockChannel,
        'malformedHandler',
      );

      const wrappedConsumer = mockChannel.consume.mock.calls[0][1];
      // Send a malformed JSON message
      const msg = buildMockMessage(Buffer.from('this is not valid json!!!'));

      wrappedConsumer(msg);
      await waitForOutstandingProcessing(connection);

      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.stringContaining('malformedHandler'),
        expect.any(String),
      );
    });

    it('should log error when message content is empty', async () => {
      const handler = vi.fn().mockImplementation((payload) => {
        if (!payload) throw new Error('Received empty payload');
      });

      await (connection as any).setupSubscriberChannel(
        handler,
        {},
        mockChannel,
        'emptyPayloadHandler',
      );

      const wrappedConsumer = mockChannel.consume.mock.calls[0][1];
      // Empty buffer produces undefined payload
      const msg = buildMockMessage(Buffer.alloc(0));

      wrappedConsumer(msg);
      await waitForOutstandingProcessing(connection);

      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.stringContaining('emptyPayloadHandler'),
        expect.any(String),
      );
    });
  });
});
