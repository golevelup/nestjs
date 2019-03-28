import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AmqpConnection } from '@nestjs-plus/rabbitmq';
import { AppModule } from '../src/app.module';

describe('Rabbit RPC', () => {
  let app: INestApplication;
  let amqpConnection: AmqpConnection;

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  describe('Unaugmented RPC Handler', () => {
    beforeEach(async () => {
      const moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      amqpConnection = app.get<AmqpConnection>(AmqpConnection);
      await app.init();
    });

    it('should receive a valid RPC response', async () => {
      const response = await amqpConnection.request(
        {
          exchange: 'exchange1',
          routingKey: 'rpc',
        },
        {
          request: 'val',
        },
      );

      expect(response).toEqual({ echo: { request: 'val' } });
    });
  });

  describe('Intercepted RPC Handler', () => {
    beforeEach(async () => {
      const moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      amqpConnection = app.get<AmqpConnection>(AmqpConnection);
      await app.init();
    });

    it('should receive an intercepted (and transformed) RPC response', async () => {
      const response = await amqpConnection.request(
        {
          exchange: 'exchange1',
          routingKey: 'intercepted-rpc',
        },
        {},
      );

      expect(response).toEqual({ transformed: { message: 42 } });
    });
  });
});
