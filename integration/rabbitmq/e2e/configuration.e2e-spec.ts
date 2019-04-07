import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQModule, RabbitMQConfig } from '@nestjs-plus/rabbitmq';
import * as amqplib from 'amqplib';

const uri = 'amqp://rabbitmq:rabbitmq@localhost:5672';

class RabbitConfig {
  createOptions(): RabbitMQConfig {
    return {
      uri,
    };
  }
}

describe('Module Configuration', () => {
  let app: TestingModule;

  afterEach(() => jest.clearAllMocks());

  describe('forRoot', () => {
    it('should configure RabbitMQ', async () => {
      const spy = jest.spyOn(amqplib, 'connect');

      app = await Test.createTestingModule({
        imports: [
          RabbitMQModule.forRoot({
            uri,
          }),
        ],
      }).compile();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(uri);
    });
  });

  describe('forRootAsync', () => {
    it('should configure RabbitMQ with useFactory', async () => {
      const spy = jest.spyOn(amqplib, 'connect');

      app = await Test.createTestingModule({
        imports: [
          RabbitMQModule.forRootAsync({
            useFactory: async () => {
              return {
                uri,
              };
            },
          }),
        ],
      }).compile();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(uri);
    });

    it('should configure RabbitMQ with useClass', async () => {
      const spy = jest.spyOn(amqplib, 'connect');

      app = await Test.createTestingModule({
        imports: [
          RabbitMQModule.forRootAsync({
            useClass: RabbitConfig,
          }),
        ],
      }).compile();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(uri);
    });

    it('should configure RabbitMQ with useExisting explicit provide', async () => {
      const spy = jest.spyOn(amqplib, 'connect');

      const instance = new RabbitConfig();

      app = await Test.createTestingModule({
        imports: [
          RabbitMQModule.forRootAsync({
            useExisting: {
              provide: RabbitConfig,
              value: instance,
            },
          }),
        ],
      }).compile();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(uri);
    });

    it('should configure RabbitMQ with useExisting implicit provide', async () => {
      const spy = jest.spyOn(amqplib, 'connect');

      const instance = new RabbitConfig();

      app = await Test.createTestingModule({
        imports: [
          RabbitMQModule.forRootAsync({
            useExisting: {
              value: instance,
            },
          }),
        ],
      }).compile();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(uri);
    });
  });
});
