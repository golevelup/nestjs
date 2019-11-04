import { RabbitMQConfig, RabbitMQModule } from '@levelup-nestjs/rabbitmq';
import { Test, TestingModule } from '@nestjs/testing';
import * as amqplib from 'amqplib';

const rabbitHost = process.env.NODE_ENV === 'ci' ? 'rabbit' : 'localhost';
const uri = `amqp://rabbitmq:rabbitmq@${rabbitHost}:5672`;

class RabbitConfig {
  createModuleConfig(): RabbitMQConfig {
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
          RabbitMQModule.forRoot(RabbitMQModule, {
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
          RabbitMQModule.forRootAsync(RabbitMQModule, {
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
          RabbitMQModule.forRootAsync(RabbitMQModule, {
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
          RabbitMQModule.forRootAsync(RabbitMQModule, {
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
          RabbitMQModule.forRootAsync(RabbitMQModule, {
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
