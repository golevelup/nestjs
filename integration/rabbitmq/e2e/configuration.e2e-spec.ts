import {
  RabbitMQConfig,
  AmqpConnection,
  RabbitMQModule,
  AmqpConnectionManager,
} from '@golevelup/nestjs-rabbitmq';
import { createMock } from '@golevelup/ts-jest';
import { Logger, Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as amqplib from 'amqplib';

const rabbitHost =
  process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_HOST : 'localhost';
const rabbitPort =
  process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_PORT : '5672';
const uri = `amqp://rabbitmq:rabbitmq@${rabbitHost}:${rabbitPort}`;
const amqplibUri = `${uri}?heartbeat=5`;
const customLogger = createMock<Logger>({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
});

const nonExistingExchange = 'non-existing-exchange';
const nonExistingQueue = 'non-existing-queue';

const testRoutingKey = 'test';

class RabbitConfig {
  create(): RabbitMQConfig {
    return {
      uri,
      connectionManagerOptions: { heartbeatIntervalInSeconds: 5 },
      connectionInitOptions: { wait: true, reject: true, timeout: 3000 },
    };
  }
}
const silentLoggerProvider: Provider = {
  provide: Logger,
  useValue: {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
};

describe('Module Configuration', () => {
  let app: TestingModule;

  afterEach(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    await app?.close();
  });

  describe('forRoot', () => {
    it('should configure RabbitMQ', async () => {
      const spy = jest.spyOn(amqplib, 'connect');
      const logSpy = jest.spyOn(customLogger, 'log');

      app = await Test.createTestingModule({
        imports: [
          RabbitMQModule.forRoot({
            uri,
            connectionInitOptions: { wait: true, reject: true, timeout: 3000 },
            logger: customLogger,
          }),
        ],
      }).compile();

      expect(app).toBeDefined();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(amqplibUri, undefined);

      expect(logSpy).toHaveBeenCalled();
    });

    it('should be able to add connection latter when rmq config is not provided through module', async () => {
      const spy = jest.spyOn(amqplib, 'connect');
      app = await Test.createTestingModule({
        providers: [silentLoggerProvider],
        imports: [RabbitMQModule.forRoot({ uri })],
      }).compile();
      const connectionManager = app.get(AmqpConnectionManager);
      const connection = new AmqpConnection({
        uri,
      });
      await connection.init();
      connectionManager.addConnection(connection);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(amqplibUri, undefined);
    });

    describe('should use `createExchangeIfNotExists` flag correctly', () => {
      it("should throw an error if exchange doesn't exist and `createExchangeIfNotExists` is false", async () => {
        try {
          app = await Test.createTestingModule({
            imports: [
              RabbitMQModule.forRoot({
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
                logger: customLogger,
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
            RabbitMQModule.forRoot({
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
              logger: customLogger,
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
            RabbitMQModule.forRoot({
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
              logger: customLogger,
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

      it("should throw an error if queue doesn't exist and `createQueueIfNotExists` is false", async () => {
        try {
          app = await Test.createTestingModule({
            imports: [
              RabbitMQModule.forRoot({
                queues: [
                  {
                    name: nonExistingQueue,
                    createQueueIfNotExists: false,
                  },
                ],
                uri,
                connectionInitOptions: {
                  wait: true,
                  reject: true,
                  timeout: 3000,
                },
                logger: customLogger,
              }),
            ],
          }).compile();

          fail(
            `Queue "${nonExistingQueue}" should not exist before running this test`,
          );
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      it('should create a queue successfully if `createQueueIfNotExists` is true', async () => {
        const spy = jest.spyOn(amqplib, 'connect');

        app = await Test.createTestingModule({
          imports: [
            RabbitMQModule.forRoot({
              queues: [
                {
                  name: nonExistingQueue,
                  createQueueIfNotExists: true,
                },
              ],
              uri,
              connectionInitOptions: {
                wait: true,
                reject: true,
                timeout: 3000,
              },
              logger: customLogger,
            }),
          ],
        }).compile();

        const amqpConnection = app.get<AmqpConnection>(AmqpConnection);
        expect(app).toBeDefined();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(amqplibUri, undefined);

        await app.init();
        expect(
          await amqpConnection.channel.checkQueue(nonExistingQueue),
        ).toBeDefined();
        await app.close();
      });

      it('should not assert queue with empty name', async () => {
        const originalConnect = amqplib.connect;
        let assertQueueSpy;

        const connectSpy = jest
          .spyOn(amqplib, 'connect')
          .mockImplementation((...args) => {
            const result = originalConnect(...args);
            result.then((conn) => {
              const originalCreateConfirmChannel = conn.createConfirmChannel;
              jest
                .spyOn(conn, 'createConfirmChannel')
                .mockImplementation(function (...args) {
                  const result = originalCreateConfirmChannel.apply(this, args);
                  result.then((channel) => {
                    assertQueueSpy = jest.spyOn(channel, 'assertQueue');
                  });
                  return result;
                });
            });
            return result;
          });

        app = await Test.createTestingModule({
          providers: [silentLoggerProvider],
          imports: [
            RabbitMQModule.forRootAsync({
              useFactory: async () => {
                return {
                  queues: [
                    {
                      name: nonExistingQueue,
                      createQueueIfNotExists: true,
                      options: {
                        durable: true,
                      },
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

        expect(app).toBeDefined();

        expect(connectSpy).toHaveBeenCalledTimes(1);
        expect(connectSpy).toHaveBeenCalledWith(amqplibUri, undefined);
        expect(assertQueueSpy).not.toHaveBeenCalledWith('', undefined);
        expect(assertQueueSpy).toHaveBeenCalledWith(nonExistingQueue, {
          durable: true,
        });

        await app.init();
        await app.close();
      });
    });
  });

  describe('forRootAsync', () => {
    it('should configure RabbitMQ with useFactory', async () => {
      const spy = jest.spyOn(amqplib, 'connect');

      app = await Test.createTestingModule({
        providers: [silentLoggerProvider],
        imports: [
          RabbitMQModule.forRootAsync({
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
        providers: [silentLoggerProvider],
        imports: [
          RabbitMQModule.forRootAsync({
            useClass: RabbitConfig,
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
            providers: [silentLoggerProvider],
            imports: [
              RabbitMQModule.forRootAsync({
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
          providers: [silentLoggerProvider],
          imports: [
            RabbitMQModule.forRootAsync({
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
          providers: [silentLoggerProvider],
          imports: [
            RabbitMQModule.forRootAsync({
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

      it('should create an exchange successfully if `createExchangeIfNotExists` is true before binding queues', async () => {
        const originalConnect = amqplib.connect;

        // Spy on the internals of amqplib to be able to introduce delays in some functions
        // to expose race conditions or unawaited promises
        const connectSpy = jest
          .spyOn(amqplib, 'connect')
          .mockImplementation((...args) => {
            const result = originalConnect(...args);
            result.then((conn) => {
              const originalCreateConfirmChannel = conn.createConfirmChannel;
              jest
                .spyOn(conn, 'createConfirmChannel')
                .mockImplementation(function (...args) {
                  const result = originalCreateConfirmChannel.apply(this, args);
                  result.then((channel) => {
                    const bindQueueSpy = jest.spyOn(channel, 'bindQueue');

                    const originalAssertExchange = channel.assertExchange;
                    jest
                      .spyOn(channel, 'assertExchange')
                      .mockImplementation(function (...args) {
                        // Delay for a long time to ensure queues are bound after exchanges are asserted
                        return new Promise((r) => setTimeout(r, 500)).then(
                          () => {
                            const result = originalAssertExchange.apply(
                              this,
                              args,
                            );
                            result.then(() => {
                              expect(bindQueueSpy).not.toBeCalled();
                            });
                            return result;
                          },
                        ) as any;
                      });
                  });
                  return result;
                });
            });
            return result;
          });

        app = await Test.createTestingModule({
          providers: [silentLoggerProvider],
          imports: [
            RabbitMQModule.forRootAsync({
              useFactory: async () => {
                return {
                  exchanges: [
                    {
                      name: nonExistingExchange,
                      type: 'topic',
                      createExchangeIfNotExists: true,
                    },
                  ],
                  queues: [
                    {
                      name: nonExistingQueue,
                      exchange: nonExistingExchange,
                      routingKey: testRoutingKey,
                    },
                  ],
                  uri,
                  connectionInitOptions: {
                    wait: true,
                    reject: true,
                    timeout: 10000,
                  },
                };
              },
            }),
          ],
        }).compile();

        const amqpConnection = app.get<AmqpConnection>(AmqpConnection);
        expect(app).toBeDefined();

        expect(connectSpy).toHaveBeenCalledTimes(1);
        expect(connectSpy).toHaveBeenCalledWith(amqplibUri, undefined);

        await app.init();
        expect(
          await amqpConnection.channel.checkExchange(nonExistingExchange),
        ).toBeDefined();
        await app.close();
      });
    });

    it('should create exchange bindings', async () => {
      const originalConnect = amqplib.connect;
      let bindExchangeSpy;

      const connectSpy = jest
        .spyOn(amqplib, 'connect')
        .mockImplementation((...args) => {
          const result = originalConnect(...args);
          result.then((conn) => {
            const originalCreateConfirmChannel = conn.createConfirmChannel;
            jest
              .spyOn(conn, 'createConfirmChannel')
              .mockImplementation(function (...args) {
                const result = originalCreateConfirmChannel.apply(this, args);
                result.then((channel) => {
                  bindExchangeSpy = jest.spyOn(channel, 'bindExchange');
                });
                return result;
              });
          });
          return result;
        });

      const otherExchangeName = 'otherExchange';

      app = await Test.createTestingModule({
        providers: [silentLoggerProvider],
        imports: [
          RabbitMQModule.forRootAsync({
            useFactory: async () => {
              return {
                exchanges: [
                  {
                    name: nonExistingExchange,
                    type: 'topic',
                    createExchangeIfNotExists: true,
                  },
                  {
                    name: otherExchangeName,
                    type: 'topic',
                    createExchangeIfNotExists: true,
                  },
                ],
                exchangeBindings: [
                  {
                    destination: otherExchangeName,
                    source: nonExistingExchange,
                    pattern: '*',
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

      expect(connectSpy).toHaveBeenCalledTimes(1);
      expect(connectSpy).toHaveBeenCalledWith(amqplibUri, undefined);
      expect(bindExchangeSpy).toHaveBeenCalledWith(
        otherExchangeName,
        nonExistingExchange,
        '*',
        undefined,
      );

      await app.init();
      expect(
        await amqpConnection.channel.checkExchange(nonExistingExchange),
      ).toBeDefined();
      await app.close();
    });
  });
});
