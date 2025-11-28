import { AmqpConnection } from '../amqp/connection';
import {
  RpcTimeoutError,
  ChannelNotAvailableError,
  ConnectionNotAvailableError,
} from '../amqp/errors';

describe('Custom RabbitMQ Errors', () => {
  describe(ChannelNotAvailableError.name, () => {
    it('should throw ChannelNotAvailableError when accessing channel before initialization', () => {
      const mockConfig = {
        uri: 'amqp://guest:guest@localhost:5672/',
      };

      const connection = new AmqpConnection(mockConfig);

      expect(() => connection.channel).toThrowError(ChannelNotAvailableError);
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

      expect(() => connection.connection).toThrowError(
        ConnectionNotAvailableError,
      );
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
