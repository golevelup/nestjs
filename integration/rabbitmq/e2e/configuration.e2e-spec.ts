import { RabbitMQConfig, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Test, TestingModule } from '@nestjs/testing';
import * as amqplib from 'amqplib';

const rabbitHost = process.env.NODE_ENV === 'ci' ? 'rabbit' : 'localhost';
const uri = `amqp://rabbitmq:rabbitmq@${rabbitHost}:5672`;
const amqplibUri = `${uri}?heartbeat=5`;

function returnUrl() {
  return {
    uri,
  };
}

class RabbitConfig {
  createModuleConfig(): RabbitMQConfig {
    return returnUrl();
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

      expect(app).toBeDefined();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(amqplibUri, undefined);
    });
  });

  describe('forRootAsync', () => {
    it('should configure RabbitMQ with useFactory', async () => {
      const spy = jest.spyOn(amqplib, 'connect');

      app = await Test.createTestingModule({
        imports: [
          RabbitMQModule.forRootAsync(RabbitMQModule, {
            useFactory: returnUrl,
          }),
        ],
      }).compile();

      expect(app).toBeDefined();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(amqplibUri, undefined);
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

      expect(app).toBeDefined();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(amqplibUri, undefined);
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

      expect(app).toBeDefined();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(amqplibUri, undefined);
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

      expect(app).toBeDefined();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(amqplibUri, undefined);
    });
  });
});
