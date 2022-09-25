import {
  RabbitMQConfig,
  AmqpConnection,
  RabbitMQModule,
} from '@golevelup/nestjs-rabbitmq';
import { ConsoleLogger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as amqplib from 'amqplib';

const rabbitHost =
  process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_HOST : 'localhost';
const rabbitPort =
  process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_PORT : '5672';
const uri = `amqp://rabbitmq:rabbitmq@${rabbitHost}:${rabbitPort}`;
const amqplibUri = `${uri}?heartbeat=5`;
const logger = new ConsoleLogger('Custom logger');

const nonExistingExchange = 'non-existing-exchange';

class RabbitConfig {
  createModuleConfig(): RabbitMQConfig {
    return {
      uri,
      connectionManagerOptions: { heartbeatIntervalInSeconds: 5 },
      connectionInitOptions: { wait: true, reject: true, timeout: 3000 },
    };
  }
}

describe('Module Configuration', () => {
  let app: TestingModule;

  afterEach(async () => {
    jest.clearAllMocks();
    await app?.close();
  });

  describe('forRoot', () => {
    it('should configure RabbitMQ', async () => {
      const spy = jest.spyOn(amqplib, 'connect');
      const logSpy = jest.spyOn(logger, 'log');

      app = await Test.createTestingModule({
        imports: [
          RabbitMQModule.forRoot(RabbitMQModule, {
            uri,
            connectionInitOptions: { wait: true, reject: true, timeout: 3000 },
            logger,
          }),
        ],
      }).compile();

      expect(app).toBeDefined();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(amqplibUri, undefined);

      expect(logSpy).toHaveBeenCalled();
    });

    describe('should use `createExchangeIfNotExists` flag correctly', () => {
      it("should throw an error if exchange doesn't exist and `createExchangeIfNotExists` is false", async () => {
        try {
          app = await Test.createTestingModule({
            imports: [
              RabbitMQModule.forRoot(RabbitMQModule, {
                exchanges: [
                  {
                    name: nonExistingExchange,
                    type: 'topic',
                    createExchangeIfNotExists: false,
                  },
                ],
                uri,
                connectionInitOptions: {
                  wait: true,
                  reject: true,
                  timeout: 3000,
                },
                logger,
              }),
            ],
          }).compile();

          fail(
            `Exchange "${nonExistingExchange}" should not exist before running this test`,
          );
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      it('should create an exchange successfully if `createExchangeIfNotExists` is true', async () => {
        const spy = jest.spyOn(amqplib, 'connect');

        app = await Test.createTestingModule({
          imports: [
            RabbitMQModule.forRoot(RabbitMQModule, {
              exchanges: [
                {
                  name: nonExistingExchange,
                  type: 'topic',
                  createExchangeIfNotExists: true,
                },
              ],
              uri,
              connectionInitOptions: {
                wait: true,
                reject: true,
                timeout: 3000,
              },
              logger,
            }),
          ],
        }).compile();

        const amqpConnection = app.get<AmqpConnection>(AmqpConnection);
        expect(app).toBeDefined();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(amqplibUri, undefined);

        await app.init();
        expect(
          await amqpConnection.channel.checkExchange(nonExistingExchange),
        ).toBeDefined();
        await app.close();
      });

      it('should connect to an existing exchange successfully if `createExchangeIfNotExists` is false', async () => {
        const spy = jest.spyOn(amqplib, 'connect');

        app = await Test.createTestingModule({
          imports: [
            RabbitMQModule.forRoot(RabbitMQModule, {
              exchanges: [
                {
                  name: nonExistingExchange,
                  type: 'topic',
                  createExchangeIfNotExists: false,
                },
              ],
              uri,
              connectionInitOptions: {
                wait: true,
                reject: true,
                timeout: 3000,
              },
              logger,
            }),
          ],
        }).compile();

        const amqpConnection = app.get<AmqpConnection>(AmqpConnection);
        expect(app).toBeDefined();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(amqplibUri, undefined);

        // Clear non-existing exchange
        await amqpConnection.channel.deleteExchange(nonExistingExchange);
      });
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
                connectionInitOptions: {
                  wait: true,
                  reject: true,
                  timeout: 3000,
                },
              };
            },
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

    describe('should use `createExchangeIfNotExists` flag correctly', () => {
      it("should throw an error if exchange doesn't exist and `createExchangeIfNotExists` is false", async () => {
        try {
          app = await Test.createTestingModule({
            imports: [
              RabbitMQModule.forRootAsync(RabbitMQModule, {
                useFactory: async () => {
                  return {
                    exchanges: [
                      {
                        name: nonExistingExchange,
                        type: 'topic',
                        createExchangeIfNotExists: false,
                      },
                    ],
                    uri,
                    connectionInitOptions: {
                      wait: true,
                      reject: true,
                      timeout: 3000,
                    },
                  };
                },
              }),
            ],
          }).compile();

          fail(
            `Exchange "${nonExistingExchange}" should not exist before running this test`,
          );
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      it('should create an exchange successfully if `createExchangeIfNotExists` is true', async () => {
        const spy = jest.spyOn(amqplib, 'connect');

        app = await Test.createTestingModule({
          imports: [
            RabbitMQModule.forRootAsync(RabbitMQModule, {
              useFactory: async () => {
                return {
                  exchanges: [
                    {
                      name: nonExistingExchange,
                      type: 'topic',
                      createExchangeIfNotExists: true,
                    },
                  ],
                  uri,
                  connectionInitOptions: {
                    wait: true,
                    reject: true,
                    timeout: 3000,
                  },
                };
              },
            }),
          ],
        }).compile();

        const amqpConnection = app.get<AmqpConnection>(AmqpConnection);
        expect(app).toBeDefined();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(amqplibUri, undefined);

        await app.init();
        expect(
          await amqpConnection.channel.checkExchange(nonExistingExchange),
        ).toBeDefined();
        await app.close();
      });

      it('should connect to an existing exchange successfully if `createExchangeIfNotExists` is false', async () => {
        const spy = jest.spyOn(amqplib, 'connect');

        app = await Test.createTestingModule({
          imports: [
            RabbitMQModule.forRootAsync(RabbitMQModule, {
              // eslint-disable-next-line
              useFactory: async () => {
                return {
                  exchanges: [
                    {
                      name: nonExistingExchange,
                      type: 'topic',
                      createExchangeIfNotExists: true,
                    },
                  ],
                  uri,
                  connectionInitOptions: {
                    wait: true,
                    reject: true,
                    timeout: 3000,
                  },
                };
              },
            }),
          ],
        }).compile();

        const amqpConnection = app.get<AmqpConnection>(AmqpConnection);
        expect(app).toBeDefined();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(amqplibUri, undefined);

        // Clear non-existing exchange
        await amqpConnection.channel.deleteExchange(nonExistingExchange);
      });
    });
  });
});
